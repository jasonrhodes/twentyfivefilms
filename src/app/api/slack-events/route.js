export async function POST(req) {
  // const computedHash = hmac.compute_hash_sha256(
  //   slack_signing_secret,
  //   sig_basestring
  // ).hexdigest()
  const { challenge } = await req.json();

  return new Response(challenge);
}
