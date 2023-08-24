export const ERROR_MESSAGES = {
   500: "server error",
  //  auth errors
   401: "unauthorized",
   400: "Missing required parameter",
   422: 'Invalid email address',
   423: 'The password does not meet the security criteria.',
   409: "this email is already in use"
 } as const;
 
 export type Terrors = keyof typeof ERROR_MESSAGES;
 