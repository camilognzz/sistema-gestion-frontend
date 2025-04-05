export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
}
