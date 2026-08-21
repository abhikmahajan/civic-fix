import fs from 'fs';
import { FormData } from 'formdata-node';
import { fileFromPathSync } from 'formdata-node/file-from-path';
import fetch from 'node-fetch';

async function test() {
  try {
    console.log('1. Creating complaint...');
    const form = new FormData();
    form.append('description', 'Kachra bhara pada hai road pe');
    form.append('latitude', '28.6139');
    form.append('longitude', '77.2090');
    // Using a hardcoded userId from the seeded DB
    form.append('user_id', '107f8728-29a2-496a-8f2d-71f6b215f3db'); 
    
    // Append the image
    const file = fileFromPathSync('./test.png', 'image/png');
    form.append('image', file);

    const res1 = await fetch('http://localhost:3001/api/complaints', {
      method: 'POST',
      body: form
    });
    const complaint = await res1.json();
    console.log('Created Complaint:', complaint);

    if (complaint.error) {
      return console.error('Error creating complaint:', complaint.error);
    }

    console.log(`2. Analyzing complaint ${complaint.id}...`);
    const res2 = await fetch(`http://localhost:3001/api/complaints/${complaint.id}/analyze`, {
      method: 'POST'
    });
    const analysis = await res2.json();
    console.log('Analysis Result:', JSON.stringify(analysis, null, 2));

  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
