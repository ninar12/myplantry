import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import AddIngredient from "@/components/AddIngredient";
import PhotoUploadStub from "@/components/PhotoUploadStub";
import RecipeGenerator from "@/components/RecipeGenerator";
import PantryList from "@/components/PantryList";
import PantryCount from "./PantryCount"; // We'll quickly add this to show the count next to the title

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold text-[#0B4D26] tracking-tight mb-2">
          Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-[#0B4D26]/70 text-lg">
          Let&apos;s see what you can cook today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Add Ingredient & Recipe Generator */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B4D26]/10">
            <h2 className="font-bold text-[#0B4D26] mb-4 text-xl">Add to Pantry</h2>
            <div className="mb-4">
              <AddIngredient />
            </div>
            <div>
              <PhotoUploadStub />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#0B4D26]/10 overflow-hidden">
            <RecipeGenerator />
          </div>
        </div>

        {/* Right Column: Pantry List */}
        <div className="lg:col-span-2">
          <div className="bg-[#FDF9F1] rounded-2xl p-6 shadow-sm border border-[#0B4D26]/10 h-full min-h-[500px]">
            <h2 className="font-bold text-[#0B4D26] mb-6 text-2xl flex items-center gap-2">
              Your Pantry
              <PantryCount />
            </h2>
            <div className="flex flex-col gap-3">
              <PantryList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
