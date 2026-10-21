// Entry point for the rooms Worker. Two routes:
//
//   POST /api/rooms          -> { code }      create a room
//   GET  /ws/:code           -> WebSocket     join (or rejoin) a room
//
// Everything stateful lives in the Room Durable Object (Room.js); this file
// only picks a room and hands the request over.
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '../../src/engine/protocol';

export { Room } from './Room';

const corsHeaders = (env) => ({
  'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

const json = (env, body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });

const randomCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(ROOM_CODE_LENGTH));
  return Array.from(bytes, b => ROOM_CODE_ALPHABET[b % ROOM_CODE_ALPHABET.length]).join('');
};

const roomStub = (env, code) => env.ROOMS.get(env.ROOMS.idFromName(code.toUpperCase()));

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) });
    }

    if (url.pathname === '/api/rooms' && request.method === 'POST') {
      // Codes are random, so a collision with a live room is unlikely but
      // possible; the room says whether it is already in use.
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = randomCode();
        const res = await roomStub(env, code).fetch(new Request(`https://room/claim?code=${code}`, { method: 'POST' }));
        if (res.ok) return json(env, { code });
      }
      return json(env, { error: 'could_not_create' }, 503);
    }

    const ws = url.pathname.match(/^\/ws\/([A-Za-z0-9]{5})$/);
    if (ws) {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return json(env, { error: 'expected_websocket' }, 426);
      }
      if (request.headers.get('Origin') !== env.ALLOWED_ORIGIN) {
        return json(env, { error: 'bad_origin' }, 403);
      }
      return roomStub(env, ws[1]).fetch(request);
    }

    return json(env, { error: 'not_found' }, 404);
  },
};
