#!/usr/bin/env python3
"""
Test script for StudyMate Profile Service
Tests all major endpoints and functionality
"""

import requests
import json
import time
import os
from pathlib import Path

# Service configuration
SERVICE_URL = "http://localhost:8006"
TEST_USER_ID = "test-user-12345"

def test_service_health():
    """Test if the service is running and healthy"""
    print("🔍 Testing service health...")
    try:
        response = requests.get(f"{SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Service is healthy: {health_data['status']}")
            print(f"📊 Database status: {health_data.get('database', {}).get('status', 'unknown')}")
            print(f"🤖 AI providers: {health_data.get('ai_providers', {})}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Could not connect to service: {e}")
        return False

def test_service_info():
    """Test the root endpoint"""
    print("\n📋 Testing service info...")
    try:
        response = requests.get(f"{SERVICE_URL}/", timeout=5)
        if response.status_code == 200:
            info = response.json()
            print(f"✅ Service: {info.get('service')}")
            print(f"📄 Version: {info.get('version')}")
            print(f"🗄️ Database: {info.get('database')}")
            return True
        else:
            print(f"❌ Service info failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Could not get service info: {e}")
        return False

def create_test_resume():
    """Create a simple test resume file"""
    print("\n📝 Creating test resume...")
    
    test_resume_content = """
JOHN DOE
Software Developer

Contact Information:
Email: john.doe@example.com
Phone: (555) 123-4567
Location: San Francisco, CA
LinkedIn: https://linkedin.com/in/johndoe
GitHub: https://github.com/johndoe

Professional Summary:
Experienced software developer with 5+ years in web development and cloud technologies.

Work Experience:
Software Engineer at Tech Corp
2021 - Present
- Developed React applications
- Built REST APIs using Node.js
- Deployed applications on AWS
Technologies: React, Node.js, AWS, Docker

Junior Developer at StartupXYZ  
2019 - 2021
- Created responsive web interfaces
- Collaborated with design team
Technologies: JavaScript, HTML, CSS

Education:
Bachelor of Science in Computer Science
University of California, Berkeley
2015 - 2019
GPA: 3.7

Projects:
E-commerce Platform
- Built full-stack e-commerce application
- Technologies: React, Express, MongoDB
- GitHub: https://github.com/johndoe/ecommerce

Skills:
Programming Languages: JavaScript, Python, Java
Frameworks: React, Express, Django
Databases: MongoDB, PostgreSQL
Cloud: AWS, Docker

Certifications:
AWS Certified Developer Associate
Issued: 2022
Credential ID: AWS-123456
"""
    
    # Create a test directory if it doesn't exist
    test_dir = Path("test_files")
    test_dir.mkdir(exist_ok=True)
    
    # Write the test resume
    resume_file = test_dir / "test_resume.txt"
    with open(resume_file, 'w') as f:
        f.write(test_resume_content)
    
    print(f"✅ Test resume created: {resume_file}")
    return resume_file

def test_resume_extraction(resume_file):
    """Test resume extraction endpoint"""
    print(f"\n🧠 Testing resume extraction...")
    
    if not os.path.exists(resume_file):
        print(f"❌ Resume file not found: {resume_file}")
        return False
    
    try:
        # Prepare the file upload
        with open(resume_file, 'rb') as f:
            files = {
                'resume': ('test_resume.txt', f, 'text/plain')
            }
            data = {
                'user_id': TEST_USER_ID
            }
            
            print("📤 Uploading resume for extraction...")
            response = requests.post(
                f"{SERVICE_URL}/extract-profile",
                files=files,
                data=data,
                timeout=30
            )
        
        if response.status_code == 200:
            extraction_result = response.json()
            print(f"✅ Extraction successful!")
            print(f"📊 Confidence score: {extraction_result.get('confidence_score', 'N/A')}%")
            
            # Display extracted data summary
            extracted_data = extraction_result.get('extracted_data', {})
            personal_info = extracted_data.get('personal_info', {})
            print(f"👤 Name: {personal_info.get('name', 'Not found')}")
            print(f"📧 Email: {personal_info.get('email', 'Not found')}")
            print(f"📱 Phone: {personal_info.get('phone', 'Not found')}")
            
            skills = extracted_data.get('skills', [])
            experience = extracted_data.get('experience', [])
            education = extracted_data.get('education', [])
            
            print(f"🎯 Skills found: {len(skills)}")
            print(f"💼 Experience entries: {len(experience)}")
            print(f"🎓 Education entries: {len(education)}")
            
            return True
        else:
            print(f"❌ Extraction failed: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Error response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during extraction: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_profile_retrieval():
    """Test profile retrieval endpoint"""
    print(f"\n👤 Testing profile retrieval for user: {TEST_USER_ID}")
    
    try:
        response = requests.get(f"{SERVICE_URL}/profile/{TEST_USER_ID}", timeout=10)
        
        if response.status_code == 200:
            profile_data = response.json()
            print("✅ Profile retrieved successfully!")
            
            profile = profile_data.get('profile', {})
            print(f"👤 Full name: {profile.get('full_name', 'Not set')}")
            print(f"📧 Email: {profile.get('email', 'Not set')}")
            print(f"📊 Completion: {profile.get('completion_percentage', 0)}%")
            
            # Count related data
            education_count = len(profile.get('education', []))
            experience_count = len(profile.get('experience', []))
            skills_count = len(profile.get('skills', []))
            projects_count = len(profile.get('projects', []))
            
            print(f"📚 Education entries: {education_count}")
            print(f"💼 Experience entries: {experience_count}")
            print(f"🎯 Skills: {skills_count}")
            print(f"🚀 Projects: {projects_count}")
            
            return True
        elif response.status_code == 404:
            print("ℹ️ Profile not found (this is expected for new users)")
            return True
        else:
            print(f"❌ Profile retrieval failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during profile retrieval: {e}")
        return False

def run_all_tests():
    """Run all tests in sequence"""
    print("🧪 StudyMate Profile Service Test Suite")
    print("=" * 50)
    
    test_results = []
    
    # Test 1: Service Health
    test_results.append(("Health Check", test_service_health()))
    
    if not test_results[-1][1]:
        print("\n❌ Service is not running. Please start the service first.")
        print("💡 Run: python backend/scripts/start-profile-service.py")
        return
    
    # Test 2: Service Info
    test_results.append(("Service Info", test_service_info()))
    
    # Test 3: Create test resume
    try:
        resume_file = create_test_resume()
    except Exception as e:
        print(f"❌ Could not create test resume: {e}")
        return
    
    # Test 4: Resume Extraction
    test_results.append(("Resume Extraction", test_resume_extraction(resume_file)))
    
    # Wait a bit for processing
    print("\n⏳ Waiting for profile processing...")
    time.sleep(2)
    
    # Test 5: Profile Retrieval
    test_results.append(("Profile Retrieval", test_profile_retrieval()))
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your Profile Service is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the error messages above.")
    
    # Cleanup
    try:
        os.remove(resume_file)
        os.rmdir("test_files")
        print("\n🧹 Cleaned up test files.")
    except:
        pass

if __name__ == "__main__":
    run_all_tests()