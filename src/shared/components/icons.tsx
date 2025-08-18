// src/components/icons.tsx
import React from "react";
import {
  User,
  Users,
  FileText,
  FileSignature,
  Upload,
} from "lucide-react";

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <User className={className} />
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Users className={className} />
);

export const DocIcon: React.FC<{ className?: string }> = ({ className }) => (
  <FileText className={className} />
);

export const SignIcon: React.FC<{ className?: string }> = ({ className }) => (
  <FileSignature className={className} />
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Upload className={className} />
);
