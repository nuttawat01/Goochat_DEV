const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const app = express();

const upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Proxy endpoint for room information
app.post('/api/rooms', async (req, res) => {
    try {
        // ใช้ dateTime จาก request body ถ้ามี หรือใช้ค่าเริ่มต้น
        const { dateTime = "12 May 2025 22:44:40", page = 1, limit = 10000 } = req.body;

        // ตรวจสอบ Authorization header
        if (!req.headers.authorization) {
            return res.status(401).json({
                statusCode: "401",
                message: "Missing authorization header",
                code: "4011"
            });
        }

        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/rooms', {
            page,
            dateTime,
            limit
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
                'App-Version': req.headers['app-version'] || '1.9.0',
                'Os-Version': req.headers['os-version'] || '12.0',
                'Accept-Language': req.headers['accept-language'] || 'en',
                'Platform': req.headers['platform'] || 'android',
                'Device-Id': req.headers['device-id'] || crypto.randomUUID(),
                'Msg-Version': '1'
            }
        });

        // ตรวจสอบ response data
        if (!response.data || !Array.isArray(response.data.data)) {
            console.error('Invalid response format:', response.data);
            return res.status(500).json({
                statusCode: "500",
                message: "Invalid response format from API",
                code: "5001"
            });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching rooms:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // ส่ง error response ที่มีรายละเอียดมากขึ้น
        res.status(error.response?.status || 500).json({
            statusCode: error.response?.data?.statusCode || "500",
            message: error.response?.data?.message || error.message || "Failed to fetch rooms",
            code: error.response?.data?.code || "5001",
            details: error.response?.data?.details || null
        });
    }
});

// Original endpoint for phone verification
app.post('/api/auth/otp/signup/verify', async (req, res) => {
    try {
        console.log('Signup verify request:', req.body);
        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/auth/otp/signup/verify', 
            {
                countryCode: req.body.countryCode,
                dialCode: req.body.dialCode,
                mobile: req.body.mobile,
                code: req.body.code,
                referenceCode: req.body.referenceCode,
                acceptTermCondition: req.body.acceptTermCondition,
                fcmToken: req.body.fcmToken
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'App-Version': '1.9.0',
                    'Os-Version': '12.0',
                    'Accept-Language': 'en',
                    'Platform': 'android',
                    'Device-Id': req.headers['device-id'],
                    'Msg-Version': '1'
                }
            }
        );
        console.log('Signup verify response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error in signup verify:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            requestBody: req.body
        });
        res.status(error.response?.status || 500).json(error.response?.data || { 
            message: 'Internal server error',
            statusCode: '500'
        });
    }
});

// Proxy endpoint for changing display name
app.post('/api/profile/name', async (req, res) => {
    try {
        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/profile/name', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
                'App-Version': req.headers['app-version'],
                'Os-Version': req.headers['os-version'],
                'Accept-Language': req.headers['accept-language'],
                'Platform': req.headers['platform'],
                'Device-Id': req.headers['device-id'],
                'Msg-Version': '1'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal server error' });
    }
});

// Proxy endpoint for sending messages
app.post('/api/chat/send', async (req, res) => {
    try {
        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/chat/send', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
                'App-Version': '1.9.0',
                'Os-Version': '12.0',
                'Accept-Language': 'en',
                'Platform': 'android',
                'Device-Id': crypto.randomUUID(),
                'Msg-Version': '1'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        if (error.response) {
            res.status(error.response.status).json({
                statusCode: error.response.data.statusCode || error.response.status.toString(),
                code: error.response.data.code || "",
                message: error.response.data.message || "System cannot process this request at the moment. Please try again later.",
                version: error.response.data.version || "",
                data: error.response.data.data || null
            });
        } else if (error.request) {
            res.status(500).json({
                statusCode: "500",
                message: "No response received from the server",
                version: "",
                data: null
            });
        } else {
            res.status(500).json({
                statusCode: "500",
                message: error.message || "Internal server error",
                version: "",
                data: null
            });
        }
    }
});

// Proxy endpoint for profile information
app.post('/api/profile/me', async (req, res) => {
    try {
        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/profile/me', {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
                'App-Version': req.headers['app-version'],
                'Os-Version': req.headers['os-version'],
                'Accept-Language': req.headers['accept-language'],
                'Platform': req.headers['platform'],
                'Device-Id': req.headers['device-id'],
                'Msg-Version': '1'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal server error' });
    }
});

// สร้างอัลบั้ม
app.post('/api/chat/album/create', async (req, res) => {
    try {
        const { sessionId, mediaCount, albumName } = req.body;
        const accessToken = req.headers.authorization;

        const response = await fetch('https://sit.apigoochat.net/gochat/v1/chat/album/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken,
                'App-Version': '1.9.0',
                'Os-Version': '12.0',
                'Accept-Language': 'en',
                'Platform': 'android',
                'Device-Id': crypto.randomUUID(),
                'Msg-Version': '1'
            },
            body: JSON.stringify({
                sessionId,
                mediaCount,
                albumName
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error creating album:', error);
        res.status(500).json({ error: 'Failed to create album' });
    }
});

// อัพเดทอัลบั้ม
app.post('/api/chat/album/update', async (req, res) => {
    try {
        const { 
            sessionId, 
            albumId, 
            actionName, 
            mediaUploadId, 
            mediaAlbum, 
            referenceKey 
        } = req.body;
        const accessToken = req.headers.authorization;

        const response = await fetch('https://sit.apigoochat.net/gochat/v1/chat/album/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken,
                'App-Version': '1.9.0',
                'Os-Version': '12.0',
                'Accept-Language': 'en',
                'Platform': 'android',
                'Device-Id': crypto.randomUUID(),
                'Msg-Version': '1'
            },
            body: JSON.stringify({
                sessionId,
                albumId,
                actionName,
                mediaUploadId,
                mediaAlbum,
                referenceKey
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error updating album:', error);
        res.status(500).json({ error: 'Failed to update album' });
    }
});

// สร้างโน็ต
app.post('/api/chat/note/create', async (req, res) => {
    try {
        const { contentNote, sessionId } = req.body;
        const accessToken = req.headers.authorization;

        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/chat/note/create', {
            contentNote,
            sessionId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken,
                'App-Version': '1.9.0',
                'Os-Version': '12.0',
                'Accept-Language': 'en',
                'Platform': 'android',
                'Device-Id': req.headers['device-id'],
                'Msg-Version': '1'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error creating note:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { 
            message: 'Failed to create note',
            statusCode: error.response?.status || '500',
            code: error.response?.data?.code || '',
            data: null
        });
    }
});

// Pin message endpoint
app.post('/api/chat/pin', async (req, res) => {
    try {
        const { sessionId, messageId } = req.body;
        const response = await fetch('https://sit.apigoochat.net/gochat/v1/chat/pin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
                'App-Version': req.headers['app-version'] || '1.9.0',
                'Os-Version': req.headers['os-version'] || '12.0',
                'Accept-Language': req.headers['accept-language'] || 'en',
                'Platform': req.headers['platform'] || 'android',
                'Device-Id': req.headers['device-id'] || crypto.randomUUID(),
                'Msg-Version': '1'
            },
            body: JSON.stringify({
                sessionId,
                messageId
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error pinning message:', error);
        res.status(500).json({ 
            statusCode: "500",
            code: error.code || "9999",
            message: error.message || "Failed to pin message" 
        });
    }
});

// Reply message endpoint
app.post('/api/chat/reply', async (req, res) => {
    try {
        const { replyMsgId, sessionId, referenceKey, contentType, content } = req.body;
        const response = await fetch('https://sit.apigoochat.net/gochat/v1/chat/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
                'App-Version': req.headers['app-version'] || '1.9.0',
                'Os-Version': req.headers['os-version'] || '12.0',
                'Accept-Language': req.headers['accept-language'] || 'en',
                'Platform': req.headers['platform'] || 'android',
                'Device-Id': req.headers['device-id'] || crypto.randomUUID(),
                'Msg-Version': '1'
            },
            body: JSON.stringify({
                replyMsgId,
                sessionId,
                referenceKey,
                contentType,
                content
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error replying to message:', error);
        res.status(500).json({ 
            statusCode: "500",
            code: error.code || "9999",
            message: error.message || "Failed to reply to message" 
        });
    }
});

// Group setting create endpoint
app.post('/api/group/setting/create', upload.none(), async (req, res) => {
    try {
        console.log('Received group creation request:', req.body);
        
        // Create form data
        const form = new FormData();
        form.append('groupName', req.body.groupName);

        // Log the form data
        console.log('Form data:', {
            groupName: req.body.groupName,
            headers: form.getHeaders()
        });

        const response = await axios.post(
            'https://sit.apigoochat.net/gochat/v1/group/setting/create',
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': req.headers.authorization,
                    'App-Version': req.headers['app-version'] || '1.9.0',
                    'Os-Version': req.headers['os-version'] || '12.0',
                    'Accept-Language': req.headers['accept-language'] || 'en',
                    'Platform': req.headers.platform || 'android',
                    'Device-Id': req.headers['device-id'],
                    'Msg-Version': '1'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log('API Response:', response.data);
        res.json(response.data);

        // ซื้อสติกเกอร์สำหรับสมาชิกใหม่
        const members = [];
        for (let i = 0; i < 10; i++) {
            const phone = `08${Math.floor(Math.random() * 900000000) + 100000000}`;
            const token = `Bearer ${Math.random().toString(36).substring(7)}`;
            members.push({
                phone: phone,
                token: token,
                displayName: `member ${i + 1} ${phone}`
            });

            try {
                currentOperation.textContent = `กำลังซื้อสติกเกอร์ให้สมาชิก ${i + 1}/${memberCount}`;
                const purchaseResponse = await fetch('https://sit.apigoochat.net/gochat/v1/sticker/purchase', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'App-Version': '1.9.0',
                        'Os-Version': '12.0',
                        'Accept-Language': 'en',
                        'Platform': 'android',
                        'Device-Id': crypto.randomUUID(),
                        'Msg-Version': '1'
                    },
                    body: JSON.stringify({
                        packageId: "651bdffda8dfd223058ccc7e"
                    })
                });
                const purchaseData = await purchaseResponse.json();
                console.log(`Sticker purchase for member ${phone}:`, purchaseData);
            } catch (purchaseError) {
                console.error(`Error purchasing sticker for member ${phone}:`, purchaseError);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            requestHeaders: error.config?.headers,
            requestData: error.config?.data
        });
        res.status(error.response?.status || 500).json(error.response?.data || {
            statusCode: "500",
            message: error.message || "Internal server error"
        });
    }
});

// Group join endpoint
app.post('/api/group/join', async (req, res) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization,
            'App-Version': req.headers['app-version'],
            'Os-Version': req.headers['os-version'],
            'Accept-Language': req.headers['accept-language'],
            'Platform': req.headers.platform,
            'Device-Id': req.headers['device-id'],
            'Msg-Version': '1'
        };

        const payload = {
            joinBy: req.body.joinBy || "LINK",
            qrCode: req.body.qrCode || "",
            sessionId: req.body.sessionId
        };

        const response = await fetch('https://sit.apigoochat.net/gochat/v1/group/join', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error in group join:', error);
        res.status(500).json({
            statusCode: "500",
            message: "Internal server error",
            error: error.message
        });
    }
});

// Sticker purchase endpoint
app.post('/api/sticker/purchase', async (req, res) => {
    try {
        const response = await fetch('https://sit.apigoochat.net/gochat/v1/sticker/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
                'App-Version': req.headers['app-version'] || '1.9.0',
                'Os-Version': req.headers['os-version'] || '12.0',
                'Accept-Language': req.headers['accept-language'] || 'en',
                'Platform': req.headers['platform'] || 'android',
                'Device-Id': req.headers['device-id'] || crypto.randomUUID(),
                'Msg-Version': '1'
            },
            body: JSON.stringify({
                packageId: req.body.packageId
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error purchasing sticker:', error);
        res.status(500).json({ 
            statusCode: "500",
            code: error.code || "9999",
            message: error.message || "Failed to purchase sticker" 
        });
    }
});

// Email signin endpoint with fixed credentials
app.post('/api/auth/email/signin', async (req, res) => {
    try {
        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/auth/email/signin', 
            {
                email: "ada@gmail.com",
                password: "2YkgPiDsG8cSizK8+ZSg9A=="
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'App-Version': '1.9.0',
                    'Os-Version': '12.0',
                    'Accept-Language': 'en',
                    'Platform': 'android',
                    'Device-Id': crypto.randomUUID(),
                    'Msg-Version': '1'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error in email signin:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        res.status(error.response?.status || 500).json(error.response?.data || { 
            message: 'Internal server error',
            statusCode: '500'
        });
    }
});

// Function to generate random email
function generateRandomEmail() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let email = '';
    for(let i = 0; i < 10; i++) {
        email += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${email}@gmail.com`;
}

// Create OA endpoint
app.post('/api/oa/create', async (req, res) => {
    try {
        const { companyName, accountName, officialId } = req.body;
        
        // Validate required fields
        if (!companyName || !accountName || !officialId) {
            return res.status(400).json({
                statusCode: "400",
                message: "Missing required fields",
                code: "4001"
            });
        }

        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/oa/create', 
            {
                companyName,
                email: generateRandomEmail(),
                accountName,
                officialId
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization,
                    'App-Version': '7.2.1',
                    'Os-Version': '17.3.1',
                    'Accept-Language': 'en',
                    'Platform': 'Desktop-App',
                    'Device-Id': '349fb28d-3118-4b7a-bb7c-2e9cb8113ad9',
                    'Msg-Version': '1'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error creating OA:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        res.status(error.response?.status || 500).json(error.response?.data || { 
            message: 'Failed to create OA',
            statusCode: '500'
        });
    }
});

// Store for OA sessions
let oaSessions = new Map();

// Friend request to OA endpoint
app.post('/api/contact/friend/request', async (req, res) => {
    try {
        const oaId = req.body.oaId || req.query.oaId; // รับ OA ID จาก body หรือ query parameter
        
        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/contact/friend/request', 
            {
                id: oaId,
                addedFrom: "ID"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization,
                    'App-Version': '1.9.0',
                    'Os-Version': '12.0',
                    'Accept-Language': 'en',
                    'Platform': 'android',
                    'Device-Id': crypto.randomUUID(),
                    'Msg-Version': '1'
                }
            }
        );

        // ถ้ามี sessionId ในการตอบกลับ เก็บไว้ใน Map
        if (response.data && response.data.data && response.data.data.sessionId) {
            oaSessions.set(oaId, {
                sessionId: response.data.data.sessionId,
                timestamp: new Date(),
                status: 'active'
            });
            
            console.log(`Stored sessionId for OA ${oaId}:`, response.data.data.sessionId);
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error sending friend request to OA:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        res.status(error.response?.status || 500).json(error.response?.data || { 
            message: 'Failed to send friend request',
            statusCode: '500'
        });
    }
});

// Endpoint เพื่อดู sessionId ที่เก็บไว้
app.get('/api/oa/sessions', (req, res) => {
    try {
        const sessions = Array.from(oaSessions.entries()).map(([oaId, data]) => ({
            oaId,
            ...data
        }));
        res.json({
            status: 'success',
            data: sessions
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve OA sessions'
        });
    }
});

// Endpoint เพื่อดู sessionId เฉพาะ OA
app.get('/api/oa/session/:oaId', (req, res) => {
    try {
        const oaId = req.params.oaId;
        const sessionData = oaSessions.get(oaId);
        
        if (sessionData) {
            res.json({
                status: 'success',
                data: {
                    oaId,
                    ...sessionData
                }
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Session not found for this OA'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve OA session'
        });
    }
});

// Function to generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to format message payload
function formatMessagePayload(payload) {
    // Convert timestamp to microseconds (multiply by 1000000)
    const now = new Date();
    const timestamp = now.getTime() * 1000000;
    
    // Format date string YYYY-MM-DD HH:mm:ss
    const dateStr = now.toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');

    // Format media object based on content type
    let formattedMedia = [];
    if (payload.media && Array.isArray(payload.media)) {
        formattedMedia = payload.media.map((media, index) => {
            const baseMedia = {
                uploadId: media.uploadId || "",
                id: media.id || crypto.randomUUID(),
                mediaRefKey: media.mediaRefKey || crypto.randomUUID(),
                imageSource: media.imageSource || `https://dummyimage.com/600x400/000/fff&text=${payload.messageNumber || (index + 1)}`,
                imageMedium: media.imageMedium || `https://dummyimage.com/600x400/000/fff&text=${payload.messageNumber || (index + 1)}`,
                imageThumbnail: media.imageThumbnail || `https://dummyimage.com/600x400/000/fff&text=${payload.messageNumber || (index + 1)}`,
                width: media.width || 800,
                height: media.height || 800,
                type: media.type || "IMAGE",
                createdTime: media.createdTime || dateStr,
                timeStamp: media.timeStamp || timestamp + (index * 1000000),
                indexMedia: media.indexMedia || index
            };

            // Add video-specific fields if type is VIDEO
            if (media.type === "VIDEO") {
                baseMedia.expDate = media.expDate || (timestamp + (7 * 24 * 60 * 60 * 1000000));
                baseMedia.duration = media.duration || 0;
                baseMedia.originalContentUrl = media.originalContentUrl || "";
            }

            return baseMedia;
        });
    }

    // Return formatted payload
    return {
        sessionId: payload.sessionId,
        referenceKey: payload.referenceKey || crypto.randomUUID(),
        contentType: payload.contentType || "TEXT",
        status: payload.status || "WAITING",
        content: payload.content || "",
        destructTime: payload.destructTime || 0,
        messagetimestamp: payload.messagetimestamp || timestamp,
        oaId: payload.oaId,
        createdTime: payload.createdTime || now.toISOString(),
        updatedTime: payload.updatedTime || dateStr,
        media: formattedMedia
    };
}

// OA send message endpoint
app.post('/api/oa/chat/send', async (req, res) => {
    try {
        const { sessionId, content = "", oaId, destructTime = 0, contentType = "TEXT", counter = 1 } = req.body;
        
        if (!sessionId || !oaId) {
            return res.status(400).json({
                statusCode: "400",
                message: "SessionId and oaId are required",
                code: "4001"
            });
        }

        // Format the message payload
        const messagePayload = formatMessagePayload({
            ...req.body,
            messageNumber: counter
        });

        // Log payload before sending
        console.log('Sending OA message payload:', JSON.stringify(messagePayload, null, 2));

        // Send the message
        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/oa/chat/send', messagePayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
                'App-Version': '1.9.0',
                'Os-Version': '12.0',
                'Accept-Language': 'en',
                'Platform': 'android',
                'Device-Id': crypto.randomUUID(),
                'Msg-Version': '1'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error sending OA message:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(error.response?.status || 500).json({
            statusCode: error.response?.data?.statusCode || "500",
            message: error.response?.data?.message || error.message || "Failed to send message",
            code: error.response?.data?.code || "5001"
        });
    }
});

// Official request endpoint
app.post('/api/official/request', async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({
                statusCode: "400",
                message: "Missing OA ID",
                code: "4001"
            });
        }

        const response = await axios.post('https://sit.apigoochat.net/gochat/v1/official/request', 
            {
                id: id,
                addedFrom: "ID"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization,
                    'App-Version': '1.9.0',
                    'Os-Version': '12.0',
                    'Accept-Language': 'en',
                    'Platform': 'android',
                    'Device-Id': crypto.randomUUID(),
                    'Msg-Version': '1'
                }
            }
        );

        // Store session ID if available in response
        if (response.data && response.data.data && response.data.data.sessionId) {
            oaSessions.set(id, {
                sessionId: response.data.data.sessionId,
                timestamp: new Date(),
                status: 'pending'
            });
            console.log(`Stored sessionId for OA ${id}:`, response.data.data.sessionId);
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error sending official request:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        res.status(error.response?.status || 500).json(error.response?.data || { 
            message: 'Failed to send official request',
            statusCode: '500'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 