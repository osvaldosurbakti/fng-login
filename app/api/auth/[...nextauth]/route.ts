import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Cast ke any untuk menghindari error typing saat memanggil NextAuth(authOptions)
const handler = (NextAuth as any)(authOptions);

export { handler as GET, handler as POST };