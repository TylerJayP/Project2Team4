const request = require('supertest');
const app = require('../server');
const fs = require('fs');
const path = require('path');

describe('Fruit Tracker API', () => {
  
  // Clean up test files after tests
  afterAll(() => {
    // Clean up any test files created
    const testDataPath = 'data/inventory.json';
    if (fs.existsSync(testDataPath)) {
      try {
        fs.unlinkSync(testDataPath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  test('GET / should return the main page', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Smart Fruit Tracker');
  });

  test('GET /api/load-inventory should return inventory data', async () => {
    const response = await request(app).get('/api/load-inventory');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('inventory');
    expect(response.body).toHaveProperty('history');
  });

  test('POST /api/save-inventory should save inventory', async () => {
    const testData = {
      inventory: { apple: 5, banana: 3 },
      history: [
        { fruit: 'apple', action: 'added', timestamp: new Date().toISOString() }
      ]
    };
    
    const response = await request(app)
      .post('/api/save-inventory')
      .send(testData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Inventory saved successfully');
  });

  test('POST /api/upload-image should handle image upload', async () => {
    // Create a simple test buffer to simulate an image
    const testImageBuffer = Buffer.from('fake image data for testing');
    
    const response = await request(app)
      .post('/api/upload-image')
      .attach('image', testImageBuffer, 'test-fruit.jpg');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('class');
    expect(response.body).toHaveProperty('confidence');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('imageUrl');
    
    // Verify the returned fruit is from our expected list
    const expectedFruits = ['apple', 'banana', 'orange', 'grape', 'strawberry'];
    expect(expectedFruits).toContain(response.body.class);
    
    // Verify confidence is within expected range
    expect(response.body.confidence).toBeGreaterThanOrEqual(0.7);
    expect(response.body.confidence).toBeLessThanOrEqual(0.95);
  });
});