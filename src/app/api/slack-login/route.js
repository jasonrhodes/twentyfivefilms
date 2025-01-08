import { generateAuthTokenForSlackUser } from '@/lib/db';
import * as logger from '@/lib/logger';
import axios from 'axios';

async function asyncProcessPostRequest(req) {
  const form = await req.formData();
  const userId = form.get('user_id');
  const username = form.get('user_name');
  const responseUrl = form.get('response_url');
  const appBaseUrl = req.url.replace('/api/slack-login', '');
  await logger.debug(() => [
    'body provided from request:',
    {
      userId,
      username,
      appBaseUrl,
      responseUrl
    }
  ]);

  try {
    const token = await generateAuthTokenForSlackUser({
      slackUserId: userId,
      username
    });

    logger.debug('attempting to send a response back to Slack');

    await axios.post(responseUrl, {
      replace_original: true,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Congrats! You can now visit 25 Films at the following login link: ${appBaseUrl}/slack-login?authToken=${token.id}`
          }
        }
      ]
    });
  } catch (error) {
    //   return new Response(
    //     JSON.stringify({
    //       message:
    //         'There was a problem generating a new auth token for this user' +
    //           error.message || error
    //     }),
    //     {
    //       status: 500,
    //       headers: {
    //         'Content-Type': 'application/json'
    //       }
    //     }
    //   );
    // }
    logger.error(
      'There was a problem while generating a new auth token for this user',
      error.message || error
    );
  }
}

export async function POST(req) {
  // do not AWAIT this so we respond immediately
  asyncProcessPostRequest(req);

  return Response.json({
    mrkdwn: true,
    text: 'This is a cool *NOT FALLBACK* message, [and a link](https://google.com)',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Logging you in, _one moment please..._'
        }
      }
    ]
  });
}
