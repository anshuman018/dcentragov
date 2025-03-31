import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { token } = JSON.parse(event.body || '{}');

  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Token is required' }),
    };
  }

  try {
    const verificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: "0x4AAAAAABDNoyyWfmeR2XauPoMR5eG-NmU",
          response: token,
        }),
      }
    );

    const data = await verificationResponse.json();

    if (data.success) {
      return {
        statusCode: 200,
        body: JSON.stringify({ verified: true }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ verified: false, errors: data['error-codes'] }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Verification failed' }),
    };
  }
};

export { handler };