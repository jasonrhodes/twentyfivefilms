import { generateAuthTokenForSlackUser } from '@/lib/db';
import * as logger from '@/lib/logger';
import axios from 'axios';
import { after } from 'next/server';

export async function POST(req) {
  const form = await req.formData();
  const userId = form.get('user_id');
  const username = form.get('user_name');
  const responseUrl = form.get('response_url');
  const appBaseUrl = req.url.replace('/api/slack-login', '');

  after(async () => {
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
        slack_user_id: userId,
        username
      });

      try {
        logger.debug('attempting to send a response back to Slack');

        const message = `Congrats! You can now visit 25 Films at the following login link: ${appBaseUrl}/slack-login?authToken=${token.id} -- don't share this link with anyone else!`;

        // use 'stdout' when testing locally if you want the link printed to stdout
        if (responseUrl === 'stdout') {
          logger.info(message);
        } else {
          await axios.post(responseUrl, {
            replace_original: true,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: message
                }
              }
            ]
          });
        }
      } catch (error) {
        logger.error(
          'There was a problem while sending the tokenized login message to the response_url',
          error.message || error
        );
      }
    } catch (error) {
      logger.error(
        'There was a problem while generating a new auth token for this user',
        error.message || error
      );
    }
  });

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
