

// FOR STUDENT

// const { createSigner } = require('fast-jwt'); 
// // If that fails, use: const { createSigner } = require('@fastify/jwt');

// const signer = createSigner({ key: 'Nd+/W0t/O9O6+TId5eB6W779m02ar5gf+Y13JBvSCuE=' });

// const token = signer({ 
//   userId: '5bed31bb-959c-4a24-8f76-30ba4c80fe87', 
//   email: 'williams1@test.com', 
//   role: 'student' 
// });

// console.log('--- YOUR TOKEN BELOW ---');
// console.log(token);
// console.log('--- END ---');


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YmVkMzFiYi05NTljLTRhMjQtOGY3Ni0zMGJhNGM4MGZlODciLCJlbWFpbCI6IndpbGxpYW1zMUB0ZXN0LmNvbSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzczNjc5MjUyfQ.P4iq5gyRyuySqPA9KV3fttFtPHW3tCSBNXFPOFm71nE



// --------------------------------------------------------------------------------------------------------------


// FOR ADMIN

// const { createSigner } = require('fast-jwt');

// const signer = createSigner({ key: 'Nd+/W0t/O9O6+TId5eB6W779m02ar5gf+Y13JBvSCuE=' });

// const adminToken = signer({ 
//   userId: 'f3b44460-3472-42c2-af38-cfd10a6dd739', // Admin ID
//   email: 'admin@test.com', 
//   role: 'admin' 
// });

// console.log('--- ADMIN TOKEN ---');
// console.log(adminToken);


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmM2I0NDQ2MC0zNDcyLTQyYzItYWYzOC1jZmQxMGE2ZGQ3MzkiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzczNjg3NjIxfQ.lmwcrq9KZd05roCe8ZyM-gqXAxEFIFTiTErwE-7igHs


// --------------------------------------------------------------------------------------------------------------


// FOR INSTRUCTOR

const { createSigner } = require('fast-jwt');

const signer = createSigner({ key: 'Nd+/W0t/O9O6+TId5eB6W779m02ar5gf+Y13JBvSCuE=' });

const instructorToken = signer({ 
  userId: '18477825-b6b4-42ff-8367-b5e9c1343989', 
  email: 'sancy1@test.com', 
  role: 'instructor' 
});

console.log('--- INSTRUCTOR TOKEN ---');
console.log(instructorToken);
console.log('--- END ---');


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxODQ3NzgyNS1iNmI0LTQyZmYtODM2Ny1iNWU5YzEzNDM5ODkiLCJlbWFpbCI6InNhbmN5MUB0ZXN0LmNvbSIsInJvbGUiOiJpbnN0cnVjdG9yIiwiaWF0IjoxNzczNzAwMTg4fQ.g8VuUMZeOFFLmOKSnknl7D2EFQDrtv1tlMw5NiifM6E










