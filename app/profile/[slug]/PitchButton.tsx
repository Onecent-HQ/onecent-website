"use client";

import { useState } from "react";
import { useUser } from "@civic/auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import PitchModal from "@/components/PitchModal";
import { Send } from "lucide-react";

interface PitchButtonProps {
  investorId: string;
  investorName: string;
  openToPitches: boolean;
}

export default function PitchButton({
  investorId,
  investorName,
  openToPitches,
}: PitchButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!openToPitches) {
    return null;
  }

  const handleClick = () => {
    if (!user) {
      // Redirect to sign in
      router.push("/signin");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className="w-full justify-center text-sm"
        variant="primary"
      >
        <Send className="w-4 h-4 mr-2" />
        Send Pitch
      </Button>
      <PitchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        investorId={investorId}
        investorName={investorName}
      />
    </>
  );
}

