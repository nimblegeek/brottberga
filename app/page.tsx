import HomePage from "./home-page";
import { upcomingGatherings } from "@/lib/events";
export const dynamic = "force-dynamic";
export default function Home() { return <HomePage events={upcomingGatherings()}/>; }
