import { CandidateForm } from "@/components/candidates/candidate-form";

export default function NewCandidatePage() {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Add New Candidate</h1>
            <CandidateForm />
        </div>
    );
}
