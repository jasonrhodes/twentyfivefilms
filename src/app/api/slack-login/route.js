import { generateAuthTokenForSlackUser } from '@/lib/db';
import { debug } from '@/lib/logger';

async function asyncProcessPostRequest(req) {
  const form = await req.formData();
  const userId = form.get('user_id');
  const username = form.get('user_name');

  await debug(() => ['body provided from request:', { userId, username }]);

  try {
    const token = await generateAuthTokenForSlackUser({
      slackUserId: userId,
      username
    });

    return Response.json({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Message received, <@${userId}>!* Your token is ${token.id} 🫡`
          }
        }
      ]
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message:
          'There was a problem generating a new auth token for this user' +
            error.message || error
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function POST(req) {
  // do not AWAIT this so we respond immediately
  // asyncProcessPostRequest(req);

  return Response.json({
    text: 'This is a cool fallback message',
    blocks: [
      {
        type: 'section',
        text: 'Logging you in, one moment please...'
      }
    ]
  });
}
