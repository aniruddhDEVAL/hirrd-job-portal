import supabaseClient from "@/utils/supabase";

// =============================
// Fetch Jobs
// =============================
export async function getJobs(token, { location, company_id, searchQuery }) {
  const supabase = await supabaseClient(token);

  let query = supabase
    .from("jobs")
    .select("*, saved: saved_jobs(id), company: companies(name,logo_url)");

  if (location) query = query.eq("location", location);
  if (company_id) query = query.eq("company_id", company_id);
  if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// =============================
// Read Saved Jobs
// =============================
export async function getSavedJobs(token) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*, job: jobs(*, company: companies(name,logo_url))");

  if (error) {
    console.error("Error fetching Saved Jobs:", error);
    return null;
  }

  return data;
}

// =============================
// Read single job
// =============================
export async function getSingleJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "*, company: companies(name,logo_url), applications: applications(*)"
    )
    .eq("id", job_id)
    .single();

  if (error) {
    console.error("Error fetching Job:", error);
    return null;
  }

  return data;
}

// ==================================================
// 🔥 FINAL CLEAN SAVE / UNSAVE (100% Hook Compatible)
// ==================================================
export async function saveJob(token, _unusedOptions, payload) {
  const supabase = await supabaseClient(token);

  const { alreadySaved, user_id, job_id } = payload || {};

  if (!user_id || !job_id) {
    console.error("Invalid save payload:", payload);
    return null;
  }

  if (alreadySaved) {
    // DELETE (unsave)
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", job_id)
      .eq("user_id", user_id);

    if (error) {
      console.error("Error removing saved job:", error);
      return null;
    }

    return [];
  } else {
    // INSERT (save)
    const { data, error } = await supabase
      .from("saved_jobs")
      .insert([{ user_id, job_id }])
      .select();

    if (error) {
      console.error("Error saving job:", error);
      return null;
    }

    return data;
  }
}

// =============================
// Toggle hiring status
// =============================
export async function updateHiringStatus(token, { job_id }, isOpen) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .update({ isOpen })
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error Updating Hiring Status:", error);
    return null;
  }

  return data;
}

// =============================
// Get My Jobs
// =============================
export async function getMyJobs(token, { recruiter_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company: companies(name,logo_url)")
    .eq("recruiter_id", recruiter_id);

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// =============================
// Delete Job
// =============================
export async function deleteJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error deleting job:", error);
    return null;
  }

  return data;
}

// =============================
// Add New Job
// =============================
export async function addNewJob(token, _, jobData) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .insert([jobData])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error Creating Job");
  }

  return data;
}
