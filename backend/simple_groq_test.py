#!/usr/bin/env python3
"""
Simple Groq Test - Just test if the API key works
"""

def simple_test():
    print("🧪 Simple Groq Test")
    print("=" * 30)
    
    import os
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        print("❌ GROQ_API_KEY environment variable not set")
        print("Please set GROQ_API_KEY in your .env file")
        return False
    
    try:
        # Install groq if needed
        try:
            import groq
        except ImportError:
            print("Installing groq...")
            import subprocess
            subprocess.check_call(["pip", "install", "groq"])
            import groq
        
        # Create client - try the simplest way
        print("Creating Groq client...")
        client = groq.Groq(api_key=api_key)
        
        # Simple test
        print("Testing API call...")
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "Say hello"}],
            max_tokens=10
        )
        
        print(f"✅ SUCCESS! Response: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {e}")
        
        # Try alternative installation
        try:
            print("Trying alternative Groq installation...")
            import subprocess
            subprocess.check_call(["pip", "uninstall", "groq", "-y"])
            subprocess.check_call(["pip", "install", "--no-cache-dir", "groq"])
            
            import groq
            client = groq.Groq(api_key=api_key)
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant", 
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            print(f"✅ SUCCESS after reinstall: {response.choices[0].message.content}")
            return True
        except Exception as e2:
            print(f"❌ Still failed: {e2}")
            return False

if __name__ == "__main__":
    simple_test()