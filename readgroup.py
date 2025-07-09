import socketio
import json
import time

# สร้าง Socket.IO client
sio = socketio.Client()

# ข้อมูลการเชื่อมต่อ - Group Chat
sessionId = "ef4077ea-b204-4f17-9aa9-a3f4bdfee82c"
bearer_token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NVVUlEIjoiNGEzMjhmZDctOTQzMi00MzY4LWJiYzMtMDc5ZmFlZDY4MDRiIiwiZGV2aWNlSUQiOiI2MzRDMzQyOC0yM0ZGLTRGNEYtODUyRi0xODgxM0RDQTZBMUIiLCJleHAiOjE3ODM1MDIzNTgsInVzZXJJRCI6IjY3ZTQwNjA1NzdlZDM4ZDY1N2M3MDMwYyJ9.bsK7TiJbeqbVMWE5JpEQhtNf64V5__elJ7p65hUJRKc"

@sio.event
def connect():
    print("Connected!")
    
    # ส่งข้อมูล messages:read สำหรับ Group Chat
    message_data = {
        "syncMsg": "1942872957869096960",
        "readTime": "2025-07-09 09:06:24",
        "sessionId": sessionId
    }
    
    sio.emit("messages:read", json.dumps(message_data))
    print("Event messages:read sent!")
    print("Data:", json.dumps(message_data))
    print("Waiting for response...")

@sio.event
def connect_error(data):
    print("Connection error:", data)

@sio.event
def disconnect():
    print("Disconnected from server")

# รับ response จาก messages:read:sessionId
def on_messages_read_response(data):
    print("✅ Received response from server:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    # ปิดการเชื่อมต่อหลังได้รับ response
    sio.disconnect()

# ลงทะเบียน event handler
sio.on(f"messages:read:{sessionId}", on_messages_read_response)

if __name__ == "__main__":
    try:
        print("🚀 Starting connection...")
        print("📡 URL: wss://sit.apigoochat.net/socket/socket.io/")
        print("🔑 Using Authorization:", bearer_token[:30] + "...")
        
        # เชื่อมต่อ socket.io
        sio.connect(
            "wss://sit.apigoochat.net",
            socketio_path="/socket/socket.io/",
            headers={
                "Platform": "ios",
                "Device-Id": "634C3428-23FF-4F4F-852F-18813DCA6A1B",
                "Authorization": bearer_token
            },
            transports=["websocket"]
        )
        
        # รอ response สูงสุด 10 วินาที
        sio.wait()
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if sio.connected:
            sio.disconnect()
        print("Connection closed") 