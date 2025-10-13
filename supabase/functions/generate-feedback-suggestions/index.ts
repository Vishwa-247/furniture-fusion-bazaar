import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get feedback data
    const { data: feedback, error: fetchError } = await supabase
      .from('dsa_feedbacks')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (fetchError || !feedback) {
      throw new Error('Feedback not found');
    }

    const prompt = `You are an expert programming mentor analyzing a student's feedback on a DSA problem.

Problem Details:
- Name: ${feedback.problem_name}
- Difficulty: ${feedback.difficulty}
- Category: ${feedback.category}

Student Feedback:
- Rating: ${feedback.rating}/5 stars
- Time Spent: ${feedback.time_spent || 'Not specified'} minutes
- Struggled With: ${feedback.struggled_areas?.join(', ') || 'Not specified'}
- Additional Feedback: ${feedback.detailed_feedback || 'None provided'}

Based on this feedback, provide:

1. **Approach Suggestions** (3-5 step-by-step strategies):
   - How to think about this problem
   - What mental models to apply
   - Key insights to notice

2. **Key Concepts** (3-5 fundamental concepts):
   - Core data structures/algorithms needed
   - Important patterns to recognize
   - Related theoretical knowledge

3. **Similar Problems** (3-4 practice recommendations):
   - Name and brief description
   - Why it's similar
   - What new skills it teaches

4. **Learning Resources** (3-4 recommendations):
   - Each should have: type (video/article/tutorial), title, description
   - Focus on filling knowledge gaps
   - Mix of beginner and intermediate resources

5. **Overall Advice** (2-3 sentences):
   - Personalized encouragement
   - Next steps for improvement

Format your response as valid JSON with this structure:
{
  "approachSuggestions": ["step 1", "step 2", ...],
  "keyConcepts": ["concept 1", "concept 2", ...],
  "similarProblems": ["problem 1", "problem 2", ...],
  "learningResources": [
    {"type": "video", "title": "...", "description": "..."},
    {"type": "article", "title": "...", "description": "..."}
  ],
  "overallAdvice": "..."
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert programming mentor. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error('Failed to generate suggestions');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let suggestions;
    try {
      suggestions = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    // Update feedback with AI suggestions
    const { error: updateError } = await supabase
      .from('dsa_feedbacks')
      .update({
        ai_suggestions: suggestions,
        ai_resources: suggestions.learningResources || []
      })
      .eq('id', feedbackId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to save suggestions');
    }

    return new Response(
      JSON.stringify({ success: true, suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});