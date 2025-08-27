import { Redirect } from "wouter";

export default function Home() {
  // Redirect to dashboard since it's the main page of our finance app
  return <Redirect to="/" />;
}
