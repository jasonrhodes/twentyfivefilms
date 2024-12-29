import * as qs from 'querystring';

export async function POST(request) {
  const bodyText = await request.text();
  const body = qs.parse(bodyText);

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(body));

  const { user_id = 'none_provided' } = body;

  return Response.json({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Message received, <@${user_id}>!* 🫡`
        }
      }
    ]
  });
}
