/* eslint-disable react/prop-types */
import { Heart, MapPinIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link } from "react-router-dom";
import useFetch from "@/hooks/use-fetch";
import { deleteJob, saveJob } from "@/api/apiJobs";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

const JobCard = ({
  job,
  savedInit = false,
  onJobAction = () => {},
  isMyJob = false,
}) => {

  if (!job) return null;

  const { user, isLoaded } = useUser();
  const [saved, setSaved] = useState(false);

  // Sync initial saved state
  useEffect(() => {
    if (savedInit || job?.saved?.length > 0) {
      setSaved(true);
    } else {
      setSaved(false);
    }
  }, [job, savedInit]);

  const { loading: loadingDeleteJob, fn: fnDeleteJob } =
    useFetch(deleteJob, { job_id: job.id });

  const { loading: loadingSavedJob, fn: fnSavedJob } =
    useFetch(saveJob);

  // ✅ FINAL CLEAN SAVE / UNSAVE HANDLER
  const handleSaveJob = async () => {
    if (!isLoaded || !user?.id) return;

    await fnSavedJob({
      alreadySaved: saved,
      user_id: user.id,
      job_id: job.id,
    });

    setSaved((prev) => !prev);
    onJobAction();
  };

  const handleDeleteJob = async () => {
    await fnDeleteJob();
    onJobAction();
  };

  return (
    <Card className="flex flex-col">
      {loadingDeleteJob && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}

      <CardHeader className="flex">
        <CardTitle className="flex justify-between font-bold">
          {job.title}
          {isMyJob && (
            <Trash2Icon
              fill="red"
              size={18}
              className="text-red-300 cursor-pointer"
              onClick={handleDeleteJob}
            />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between">
          {job.company && (
            <img src={job.company.logo_url} className="h-6" />
          )}
          <div className="flex gap-2 items-center">
            <MapPinIcon size={15} /> {job.location}
          </div>
        </div>
        <hr />
        {job.description?.includes(".")
          ? job.description.substring(0, job.description.indexOf(".")) + "."
          : job.description}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link to={`/job/${job.id}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            More Details
          </Button>
        </Link>

        {!isMyJob && (
          <Button
            variant="outline"
            className="w-15"
            onClick={handleSaveJob}
            disabled={loadingSavedJob || !isLoaded}
          >
            {saved ? (
              <Heart size={20} fill="red" stroke="red" />
            ) : (
              <Heart size={20} />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
