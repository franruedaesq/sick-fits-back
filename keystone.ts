import { config, createSchema } from "@keystone-next/keystone/schema";
import { createAuth } from "@keystone-next/auth";
import "dotenv/config";
import { User } from "./schemas/User";
import { Product } from "./schemas/Product";
import { ProductImage } from "./schemas/ProductImage";
import {
  withItemData,
  statelessSessions,
} from "@keystone-next/keystone/session";
import { insertSeedData } from "./seed-data/index";
import { sendPasswordResetEmail } from "./lib/mail";
import { CartItem } from "./schemas/CartItem";
import { extendGraphqlSchema } from "./mutations";

const databasURL =
  process.env.DATABASE_URL || "mongodb://localhost/keystone-sick-fits";

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360,
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"],
    // TODO: Add in initial roles here
  },
  passwordResetLink: {
    async sendToken(args) {
      const { token, identity } = args;
      await sendPasswordResetEmail(token, identity);
    },
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [
          process.env.FRONTEND_URL,
          "https://sick-fits-front.vercel.app",
          "https://sick-fits-front-iyh0n6up4-franruedaesq.vercel.app",
          "https://sick-fits-front-7tn97mq9n-franruedaesq.vercel.app",
          "https://sick-fits-front-gggry2dm3-franruedaesq.vercel.app",
        ],
        credentials: true,
      },
    },
    db: {
      adapter: "mongoose",
      url: databasURL,
      async onConnect(keystone) {
        if (process.argv.includes("--seed-data")) {
          await insertSeedData(keystone);
        }
      },
    },
    lists: createSchema({
      // schema items go in here
      User,
      Product,
      ProductImage,
      CartItem,
    }),
    extendGraphqlSchema: extendGraphqlSchema,
    ui: {
      // Show the UI only for people who pass this test
      isAccessAllowed: ({ session }) => {
        return !!session?.data;
      },
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // Graph Query
      User: "id, name, email",
    }),
  })
);
