import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CourseRequest {
  topic: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, userId } = await req.json() as CourseRequest;
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const BRAVE_API_KEY = Deno.env.get('BRAVE_SEARCH_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    console.log(`🚀 Starting course generation for: ${topic}`);

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        user_id: userId,
        title: topic,
        purpose: 'practice',
        difficulty: 'intermediate',
        status: 'generating',
        summary: `AI-generated course on ${topic}`,
        is_oboe_style: true
      })
      .select()
      .single();

    if (courseError) throw courseError;

    const courseId = course.id;
    console.log(`✅ Course created with ID: ${courseId}`);

    const { data: job } = await supabase
      .from('course_generation_jobs')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'processing',
        job_type: 'course_creation',
        current_step: 'Starting parallel generation',
        progress_percentage: 5
      })
      .select()
      .single();

    console.log(`✅ Generation job created: ${job?.id}`);

    generateInParallel(supabase, courseId, topic, userId, GEMINI_API_KEY, ELEVENLABS_API_KEY, BRAVE_API_KEY)
      .catch((err) => console.error('Background generation error:', err));

    return new Response(JSON.stringify({
      success: true,
      courseId,
      jobId: job?.id,
      estimatedTime: 40
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateInParallel(
  supabase: any,
  courseId: string,
  topic: string,
  userId: string,
  geminiKey: string,
  elevenLabsKey: string | undefined,
  braveKey: string | undefined
) {
  const startTime = Date.now();

  try {
    await updateProgress(supabase, courseId, 10, 'Generating course outline...');

    const outline = await generateOutline(geminiKey, topic);
    console.log(`✅ Outline generated with ${outline.chapters.length} chapters`);
    await updateProgress(supabase, courseId, 20, 'Outline created! Generating content...');

    const [
      chapters,
      flashcards,
      mcqs,
      articles,
      wordGames,
      audioScripts
    ] = await Promise.all([
      generateChapters(supabase, courseId, topic, outline, geminiKey),
      generateFlashcards(supabase, courseId, topic, geminiKey),
      generateMCQs(supabase, courseId, topic, geminiKey),
      generateArticles(supabase, courseId, topic, geminiKey),
      generateWordGames(supabase, courseId, topic, geminiKey),
      generateAudioScripts(topic, outline, geminiKey)
    ]);

    console.log('✅ All content generated:', { chapters: chapters.length, flashcards: flashcards.length, mcqs: mcqs.length });
    await updateProgress(supabase, courseId, 60, 'Content generated! Creating audio...');

    if (elevenLabsKey) {
      await Promise.all([
        generateTTS(supabase, courseId, audioScripts.short, 'short_podcast', elevenLabsKey),
        generateTTS(supabase, courseId, audioScripts.long, 'full_lecture', elevenLabsKey)
      ]);
      await supabase.from('courses').update({ audio_generated: true }).eq('id', courseId);
      console.log('✅ Audio generated');
    }

    await updateProgress(supabase, courseId, 80, 'Finding resources...');

    if (braveKey) {
      await findResources(supabase, courseId, topic, braveKey);
      console.log('✅ Resources found');
    }

    await updateProgress(supabase, courseId, 90, 'Generating suggestions...');
    await generateSuggestions(supabase, courseId, topic, geminiKey);

    const duration = Math.round((Date.now() - startTime) / 1000);
    
    await supabase.from('courses').update({
      status: 'published',
      generation_duration_seconds: duration,
      articles_generated: true,
      games_generated: true
    }).eq('id', courseId);

    await supabase.from('course_generation_jobs').update({
      status: 'completed',
      progress_percentage: 100,
      current_step: 'Course ready!',
      completed_at: new Date().toISOString()
    }).eq('course_id', courseId);

    console.log(`✅ Course ${courseId} generated in ${duration}s`);

  } catch (error) {
    console.error('Generation error:', error);
    await supabase.from('course_generation_jobs').update({
      status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString()
    }).eq('course_id', courseId);
  }
}

async function updateProgress(supabase: any, courseId: string, percent: number, step: string) {
  await supabase.from('course_generation_jobs').update({
    progress_percentage: percent,
    current_step: step
  }).eq('course_id', courseId);
}

async function generateOutline(geminiKey: string, topic: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a detailed course outline for: "${topic}".
            
Include:
- 3-5 main chapters
- Learning objectives
- Key concepts per chapter
- Estimated reading time

Format as JSON:
{
  "chapters": [
    {
      "title": "string",
      "objectives": ["string"],
      "keyConcepts": ["string"],
      "estimatedMinutes": number
    }
  ]
}`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : JSON.parse(text);
}

async function generateChapters(supabase: any, courseId: string, topic: string, outline: any, geminiKey: string) {
  const chapters = [];
  
  for (let i = 0; i < outline.chapters.length; i++) {
    const chapter = outline.chapters[i];
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Write detailed chapter content for:
              
Topic: ${topic}
Chapter: ${chapter.title}
Objectives: ${chapter.objectives.join(', ')}

Write 300-500 words covering:
- Introduction
- Key concepts explained
- Real-world examples
- Summary

Write in clear, educational style suitable for learners.`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    chapters.push({
      course_id: courseId,
      title: chapter.title,
      content: content,
      order_number: i + 1,
      estimated_reading_time: chapter.estimatedMinutes || 10
    });
  }

  await supabase.from('course_chapters').insert(chapters);
  return chapters;
}

async function generateFlashcards(supabase: any, courseId: string, topic: string, geminiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate 10 flashcards for learning: "${topic}".

Each flashcard should have:
- A clear question
- A concise answer (2-3 sentences)

Format as JSON array:
[
  {
    "question": "string",
    "answer": "string"
  }
]`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
  const flashcards = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : JSON.parse(text);

  await supabase.from('course_flashcards').insert(
    flashcards.map((f: any) => ({
      course_id: courseId,
      question: f.question,
      answer: f.answer,
      difficulty: 'medium'
    }))
  );

  return flashcards;
}

async function generateMCQs(supabase: any, courseId: string, topic: string, geminiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate 10 multiple choice questions for: "${topic}".

Each MCQ should have:
- Clear question
- 4 options (A, B, C, D)
- Correct answer
- Brief explanation

Format as JSON array:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correct": "A",
    "explanation": "string"
  }
]`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
  const mcqs = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : JSON.parse(text);

  await supabase.from('course_mcqs').insert(
    mcqs.map((m: any) => ({
      course_id: courseId,
      question: m.question,
      options: m.options,
      correct_answer: m.correct,
      explanation: m.explanation,
      difficulty: 'medium'
    }))
  );

  return mcqs;
}

async function generateArticles(supabase: any, courseId: string, topic: string, geminiKey: string) {
  const deepDiveResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Write a comprehensive deep-dive article on: "${topic}".

Include:
- Introduction (what and why)
- Core concepts (detailed explanations)
- Real-world applications
- Common challenges and solutions
- Conclusion

Length: 800-1000 words.
Style: Educational, engaging, clear.`
          }]
        }]
      })
    }
  );

  const deepDiveData = await deepDiveResponse.json();
  const deepDive = deepDiveData.candidates[0].content.parts[0].text;

  const takeawaysResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Summarize the key takeaways for: "${topic}".

Format as 5-7 bullet points, each 1-2 sentences.
Focus on the most important concepts to remember.`
          }]
        }]
      })
    }
  );

  const takeawaysData = await takeawaysResponse.json();
  const takeaways = takeawaysData.candidates[0].content.parts[0].text;

  const faqResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate 8-10 FAQ (Frequently Asked Questions) for: "${topic}".

Format as JSON array:
[
  {
    "question": "string",
    "answer": "string (2-3 sentences)"
  }
]`
          }]
        }]
      })
    }
  );

  const faqData = await faqResponse.json();
  const faqText = faqData.candidates[0].content.parts[0].text;
  const faqMatch = faqText.match(/```json\n([\s\S]*?)\n```/) || faqText.match(/\[[\s\S]*\]/);
  const faq = faqMatch ? JSON.parse(faqMatch[1] || faqMatch[0]) : JSON.parse(faqText);

  await supabase.from('course_articles').insert([
    {
      course_id: courseId,
      article_type: 'deep_dive',
      title: `Deep Dive: ${topic}`,
      content: deepDive,
      reading_time_minutes: 10
    },
    {
      course_id: courseId,
      article_type: 'key_takeaways',
      title: `Key Takeaways: ${topic}`,
      content: takeaways,
      reading_time_minutes: 3
    },
    {
      course_id: courseId,
      article_type: 'faq',
      title: `FAQ: ${topic}`,
      content: JSON.stringify(faq),
      reading_time_minutes: 5
    }
  ]);

  return { deepDive, takeaways, faq };
}

async function generateWordGames(supabase: any, courseId: string, topic: string, geminiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate 15 vocabulary words related to: "${topic}".

Each entry should have:
- Word/term
- Correct definition
- 3 incorrect but plausible definitions

Format as JSON array:
[
  {
    "word": "string",
    "correct": "string",
    "incorrect": ["string", "string", "string"]
  }
]`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
  const words = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : JSON.parse(text);

  await supabase.from('course_word_games').insert(
    words.map((w: any) => ({
      course_id: courseId,
      word: w.word,
      definition: w.correct,
      incorrect_options: w.incorrect,
      difficulty: 'medium'
    }))
  );

  return words;
}

async function generateAudioScripts(topic: string, outline: any, geminiKey: string) {
  const shortResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Write a 5-minute podcast script introducing: "${topic}".

Style:
- Conversational, engaging tone
- Like a friend explaining the concept
- Include a hook at the start
- Clear structure: intro, main points, conclusion

Length: ~700 words (5 min reading time)

Do NOT include speaker labels or stage directions. Write as continuous speech.`
          }]
        }]
      })
    }
  );

  const shortData = await shortResponse.json();
  const shortScript = shortData.candidates[0].content.parts[0].text;

  const longResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Write a comprehensive 20-minute lecture on: "${topic}".

Cover:
- Introduction and importance
- Core concepts in depth
- Real-world examples and applications
- Common misconceptions
- Best practices
- Summary and next steps

Style: Educational but engaging, like a great teacher.
Length: ~3000 words (20 min reading time)

Do NOT include speaker labels or stage directions. Write as continuous speech.`
          }]
        }]
      })
    }
  );

  const longData = await longResponse.json();
  const longScript = longData.candidates[0].content.parts[0].text;

  return { short: shortScript, long: longScript };
}

async function generateTTS(
  supabase: any,
  courseId: string,
  script: string,
  type: 'short_podcast' | 'full_lecture',
  elevenLabsKey: string
) {
  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x',
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey
        },
        body: JSON.stringify({
          text: script.substring(0, 5000),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.arrayBuffer();

    const fileName = `${courseId}/${type}_${Date.now()}.mp3`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg'
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('course-audio')
      .getPublicUrl(fileName);

    await supabase.from('course_audio').insert({
      course_id: courseId,
      audio_type: type,
      audio_url: urlData.publicUrl,
      script_text: script,
      duration_seconds: type === 'short_podcast' ? 300 : 1200,
      voice_used: 'Aria'
    });

    console.log(`✅ Generated ${type} audio for course ${courseId}`);

  } catch (error) {
    console.error(`TTS generation failed for ${type}:`, error);
  }
}

async function findResources(supabase: any, courseId: string, topic: string, braveKey: string) {
  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(topic + ' tutorial documentation')}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': braveKey
        }
      }
    );

    const data = await response.json();
    const results = data.web?.results || [];

    const resources = results.slice(0, 5).map((result: any) => ({
      course_id: courseId,
      title: result.title,
      type: 'article',
      url: result.url,
      description: result.description,
      provider: new URL(result.url).hostname
    }));

    if (resources.length > 0) {
      await supabase.from('course_resources').insert(resources);
    }

  } catch (error) {
    console.error('Resource finding failed:', error);
  }
}

async function generateSuggestions(supabase: any, courseId: string, topic: string, geminiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Based on learning "${topic}", suggest 5 related topics to learn next.

Each suggestion should:
- Be relevant and build on this knowledge
- Have a brief description (1 sentence)

Format as JSON array:
[
  {
    "topic": "string",
    "description": "string"
  }
]`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
  const suggestions = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : JSON.parse(text);

  await supabase.from('course_suggestions').insert(
    suggestions.map((s: any, index: number) => ({
      course_id: courseId,
      suggestion_topic: s.topic,
      suggestion_description: s.description,
      relevance_score: 5 - index
    }))
  );
}
