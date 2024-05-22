FROM denoland/deno-lambda:1.43.5

COPY index.deno.ts index.ts
COPY package.json .
RUN deno cache index.ts

CMD ["index.handler"]