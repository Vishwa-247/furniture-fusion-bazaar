#!/usr/bin/env python3
"""
Direct Groq API Test
===================

Test the exact API key from your .env file
"""

def test_direct_groq():
    print("🔍 Direct Groq API Test")
    print("=" * 40)
    
    # Use API key from environment variable
    import os
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        print("❌ GROQ_API_KEY environment variable not set")
        print("Please set GROQ_API_KEY in your .env file")
        return False
    
    print(f"🔑 Using API key from environment variable")
    
    # Test basic import
    try:
        from groq import Groq
        print("✅ Groq library imported")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Test different client initialization methods
    client = None
    
    # Method 1: Direct initialization
    try:
        client = Groq(api_key=api_key)
        print("✅ Method 1: Groq() initialization successful")
    except Exception as e:
        print(f"❌ Method 1 failed: {e}")
        
        # Method 2: Try with minimal parameters
        try:
            import groq
            client = groq.Groq(api_key=api_key)
            print("✅ Method 2: groq.Groq() initialization successful")
        except Exception as e2:
            print(f"❌ Method 2 failed: {e2}")
            
            # Method 3: Try older style
            try:
                from groq import Client
                client = Client(api_key=api_key)
                print("✅ Method 3: Client() initialization successful")
            except Exception as e3:
                print(f"❌ Method 3 failed: {e3}")
                
                # Method 4: Try even simpler
                try:
                    import groq
                    client = groq.Client(api_key=api_key)
                    print("✅ Method 4: groq.Client() initialization successful")
                except Exception as e4:
                    print(f"❌ All methods failed. Last error: {e4}")
                    return False
    
    if not client:
        print("❌ Could not initialize any Groq client")
        return False
    
    # Test API call
    try:
        print("🧪 Testing API call...")
        response = client.chat.completions.create(
            messages=[
                {"role": "user", "content": "Respond with just 'Hello from Groq!'"}
            ],
            model="llama-3.1-8b-instant",
            max_tokens=10
        )
        
        result = response.choices[0].message.content
        print(f"✅ API call successful!")
        print(f"📄 Response: {result}")
        return True
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        print("🔍 This could mean:")
        print("   - API key is invalid or expired")
        print("   - Network connectivity issue")
        print("   - Groq service is down")
        print("   - Rate limit exceeded")
        return False

def test_api_key_validity():
    """Test if the API key format is correct"""
    print("\n🔍 API Key Format Check")
    print("=" * 40)
    
    import os
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        print("❌ GROQ_API_KEY environment variable not set")
        return False
    
    # Check format
    if api_key.startswith("gsk_"):
        print("✅ API key has correct prefix (gsk_)")
    else:
        print("❌ API key should start with 'gsk_'")
        return False
    
    if len(api_key) >= 50:
        print(f"✅ API key has reasonable length ({len(api_key)} chars)")
    else:
        print(f"❌ API key seems too short ({len(api_key)} chars)")
        return False
    
    print("✅ API key format looks correct")
    return True

def test_network_connectivity():
    """Test if we can reach Groq servers"""
    print("\n🌐 Network Connectivity Test")
    print("=" * 40)
    
    try:
        import requests
        response = requests.get("https://api.groq.com/openai/v1/models", timeout=10)
        print(f"✅ Can reach Groq servers (status: {response.status_code})")
        return True
    except Exception as e:
        print(f"❌ Cannot reach Groq servers: {e}")
        print("💡 Check your internet connection")
        return False

def main():
    print("🧪 Comprehensive Groq Test")
    print("=" * 50)
    
    # Test 1: API key format
    format_ok = test_api_key_validity()
    
    # Test 2: Network connectivity
    network_ok = test_network_connectivity()
    
    # Test 3: Direct API test
    api_ok = test_direct_groq()
    
    print("\n" + "=" * 50)
    print("📊 RESULTS")
    print("=" * 50)
    print(f"API Key Format: {'✅ PASS' if format_ok else '❌ FAIL'}")
    print(f"Network Access:  {'✅ PASS' if network_ok else '❌ FAIL'}")
    print(f"Groq API Test:   {'✅ PASS' if api_ok else '❌ FAIL'}")
    
    if format_ok and network_ok and api_ok:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Your Groq API key is working correctly")
        print("💡 You can now use resume upload with confidence")
    else:
        print("\n⚠️ SOME TESTS FAILED")
        if not format_ok:
            print("🔧 Get a new API key from: https://groq.com/")
        if not network_ok:
            print("🔧 Check your internet connection")
        if not api_ok:
            print("🔧 Try getting a fresh API key or check Groq status")

if __name__ == "__main__":
    main()
