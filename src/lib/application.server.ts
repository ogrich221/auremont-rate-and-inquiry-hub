import fs from "node:fs";
import path from "node:path";
import type { ApplicationRecord, ApplicationStatus } from "@/components/bank/registration/types";

// In-memory cache + persistent file fallback
let applicationsCache: ApplicationRecord[] | null = null;

const STORAGE_FILE = path.resolve(process.cwd(), ".lovable", "applications-store.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function loadApplications(): ApplicationRecord[] {
  if (applicationsCache !== null) return applicationsCache;
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      applicationsCache = JSON.parse(raw);
      return applicationsCache ?? [];
    }
  } catch (err) {
    console.warn("Could not read applications store from disk, initializing empty:", err);
  }
  applicationsCache = [];
  return applicationsCache;
}

function saveApplications(records: ApplicationRecord[]) {
  applicationsCache = records;
  try {
    ensureDirectoryExistence(STORAGE_FILE);
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist applications to disk:", err);
  }
}

export function saveNewApplication(record: ApplicationRecord): ApplicationRecord {
  const current = loadApplications();
  const updated = [record, ...current.filter((r) => r.referenceNumber !== record.referenceNumber)];
  saveApplications(updated);
  return record;
}

export function getApplicationByRef(ref: string): ApplicationRecord | null {
  const current = loadApplications();
  return current.find((r) => r.referenceNumber.toLowerCase() === ref.trim().toLowerCase()) ?? null;
}

export function getAllApplications(): ApplicationRecord[] {
  return loadApplications();
}

export function updateApplicationReview(
  ref: string,
  newStatus: ApplicationStatus,
  decisionNote: string,
  actor = "Compliance Administrator",
): ApplicationRecord | null {
  const current = loadApplications();
  const index = current.findIndex((r) => r.referenceNumber.toLowerCase() === ref.trim().toLowerCase());
  if (index === -1) return null;

  const now = new Date().toISOString();
  const target = current[index];
  if (!target) return null;
  const updatedRecord: ApplicationRecord = {
    ...target,
    status: newStatus,
    updatedAt: now,
    auditTrail: [
      {
        timestamp: now,
        actor,
        action: `Status updated to ${newStatus}`,
        note: decisionNote,
      },
      ...target.auditTrail,
    ],
  };

  current[index] = updatedRecord;
  saveApplications([...current]);
  return updatedRecord;
}
