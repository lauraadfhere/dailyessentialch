import { connection } from "next/server";
import { getProfile } from "@/lib/profile";
import { ProfileForm } from "../../profile-form";

export default async function AdminProfilePage() {
  await connection();
  const profile = await getProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-display text-[32px] font-medium leading-tight">Profile</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#565959]">
          Update the avatar and biography shown on the author page. Changes appear immediately after saving.
        </p>
        {profile.updatedAt && (
          <p className="mt-2 text-[12px] text-[#565959]">Last saved {new Date(profile.updatedAt).toLocaleString("en-GB")}</p>
        )}
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
