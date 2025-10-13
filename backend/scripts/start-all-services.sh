#!/bin/bash

echo "🚀 Starting All StudyMate Backend Services..."
echo "============================================="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to start a service in background
start_service() {
    local script_name="$1"
    local service_name="$2"
    local port="$3"
    
    echo "📡 Starting $service_name on port $port..."
    "$SCRIPT_DIR/$script_name" &
    local pid=$!
    echo "✅ $service_name started with PID: $pid"
    return $pid
}

# Start each service
echo ""
echo "🔧 Starting services in sequence..."
echo ""

# Start Profile Service (Port 8006)
start_service "start-profile-service.sh" "Profile Service" "8006"
profile_pid=$!
sleep 3

# Start Resume Analyzer (Port 8003)  
start_service "start-resume-analyzer.sh" "Resume Analyzer" "8003"
resume_pid=$!
sleep 3

# Start API Gateway (Port 8000) - Last since it routes to other services
start_service "start-api-gateway.sh" "API Gateway" "8000"
gateway_pid=$!
sleep 3

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "Service URLs:"
echo "📡 API Gateway: http://localhost:8000"
echo "👤 Profile Service: http://localhost:8006" 
echo "📄 Resume Analyzer: http://localhost:8003"
echo ""
echo "Health Checks:"
echo "curl http://localhost:8000/health"
echo "curl http://localhost:8006/health"
echo "curl http://localhost:8003/health"
echo ""
echo "📖 API Documentation:"
echo "http://localhost:8000/docs (API Gateway)"
echo "http://localhost:8006/docs (Profile Service)"
echo "http://localhost:8003/docs (Resume Analyzer)"
echo ""
echo "To stop all services, press Ctrl+C or run: pkill -f 'python.*main.py'"
echo "============================================="

# Wait for any service to exit
wait