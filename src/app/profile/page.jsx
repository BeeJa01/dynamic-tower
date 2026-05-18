import { generatePageMetadata } from "@/lib/metadata";
import ProfileClient from "@/components/ProfileClient";

export const metadata = generatePageMetadata({
  title:       'My Orders & Profile',
  description: 'Track your Dynamic Tower food orders and manage your profile.',
  path:        '/profile',
});

export default function Profile() {
  return <ProfileClient />;
}