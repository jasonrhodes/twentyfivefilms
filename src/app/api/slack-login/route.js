export async function POST(request) {
  const body = await request.json();
  // eslint-disable-next-line no-console
  console.log(request, body);

  return Response.json({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Message received, sir!* 🫡'
        }
      }
    ]
  });
}
