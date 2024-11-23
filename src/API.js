export const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI5N2FmNjg0NC02ZjM5LTRjMDMtYmQ4Ny0xNGQ5MzJhMTAwZDUiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczMjM1NzI2MiwiZXhwIjoxNzMyOTYyMDYyfQ.kqNDwPfDBauk9m-ULL23oNCtIT30wyVp-BjnxPGbFEU";

// API call to create meeting
export const createMeeting = async ({ token }) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const { roomId } = await res.json();
  return roomId;
};
