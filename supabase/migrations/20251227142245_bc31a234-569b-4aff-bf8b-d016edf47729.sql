-- Create enum types for roles and membership
CREATE TYPE public.user_role AS ENUM ('kid', 'parent', 'admin', 'super_admin');
CREATE TYPE public.membership_type AS ENUM ('free', 'paid');
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create profiles table for all users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'kid',
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kids table
CREATE TABLE public.kids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  age INTEGER NOT NULL CHECK (age >= 6 AND age <= 17),
  school_name TEXT NOT NULL,
  school_id_url TEXT,
  interests TEXT[] DEFAULT '{}',
  membership membership_type NOT NULL DEFAULT 'free',
  membership_expires_at TIMESTAMP WITH TIME ZONE,
  parent_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parents table
CREATE TABLE public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  aadhaar_encrypted TEXT,
  aadhaar_last_four TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parent-child relationship table
CREATE TABLE public.parent_child_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL,
  kid_id UUID REFERENCES public.kids(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_id, kid_id)
);

-- Create locations table
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT,
  sector TEXT,
  colony TEXT,
  full_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verification requests table
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL,
  kid_id UUID REFERENCES public.kids(id) ON DELETE CASCADE NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user's profile
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Kids policies
CREATE POLICY "Users can view their own kid profile"
  ON public.kids FOR SELECT
  USING (profile_id = public.get_current_profile_id());

CREATE POLICY "Users can insert their own kid profile"
  ON public.kids FOR INSERT
  WITH CHECK (profile_id = public.get_current_profile_id());

CREATE POLICY "Users can update their own kid profile"
  ON public.kids FOR UPDATE
  USING (profile_id = public.get_current_profile_id());

CREATE POLICY "Parents can view linked kids"
  ON public.kids FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_child_links pcl
      JOIN public.parents p ON pcl.parent_id = p.id
      WHERE pcl.kid_id = kids.id
      AND p.profile_id = public.get_current_profile_id()
    )
  );

-- Parents policies
CREATE POLICY "Users can view their own parent profile"
  ON public.parents FOR SELECT
  USING (profile_id = public.get_current_profile_id());

CREATE POLICY "Users can insert their own parent profile"
  ON public.parents FOR INSERT
  WITH CHECK (profile_id = public.get_current_profile_id());

CREATE POLICY "Users can update their own parent profile"
  ON public.parents FOR UPDATE
  USING (profile_id = public.get_current_profile_id());

-- Parent-child links policies
CREATE POLICY "Parents can view their links"
  ON public.parent_child_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parents p
      WHERE p.id = parent_child_links.parent_id
      AND p.profile_id = public.get_current_profile_id()
    )
  );

CREATE POLICY "Parents can create links"
  ON public.parent_child_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.parents p
      WHERE p.id = parent_child_links.parent_id
      AND p.profile_id = public.get_current_profile_id()
    )
  );

-- Locations policies
CREATE POLICY "Users can manage their own location"
  ON public.locations FOR ALL
  USING (profile_id = public.get_current_profile_id());

-- Verification requests policies
CREATE POLICY "Parents can view their verification requests"
  ON public.verification_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parents p
      WHERE p.id = verification_requests.parent_id
      AND p.profile_id = public.get_current_profile_id()
    )
  );

CREATE POLICY "Parents can create verification requests"
  ON public.verification_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.parents p
      WHERE p.id = verification_requests.parent_id
      AND p.profile_id = public.get_current_profile_id()
    )
  );

CREATE POLICY "Admins can manage verification requests"
  ON public.verification_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kids_updated_at
  BEFORE UPDATE ON public.kids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON public.parents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Additional tables for full functionality

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
  ('Sports', 'Sports equipment and gear'),
  ('Studies', 'Books, stationery, and study materials'),
  ('Music', 'Musical instruments and accessories'),
  ('Accessories', 'General accessories'),
  ('Clothes', 'Clothing items'),
  ('Electronics', 'Electronic gadgets and devices'),
  ('Cards', 'Trading cards and collectibles'),
  ('Robotics', 'Robotics kits like LEGO'),
  ('Board Games', 'Board games and puzzles');

-- Create listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID REFERENCES public.kids(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  brand TEXT,
  age TEXT, -- e.g., '6-8 years'
  color TEXT,
  size TEXT,
  photos TEXT[] DEFAULT '{}', -- URLs to photos/videos
  wants_in_exchange TEXT, -- what they want in return
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_moderated BOOLEAN NOT NULL DEFAULT false,
  moderated_by UUID REFERENCES public.profiles(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  responder_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'rejected', 'scheduled', 'completed', 'cancelled')),
  proposed_exchange TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  meetup_location TEXT,
  meetup_coordinates TEXT, -- lat,lng
  parent_approval_status TEXT DEFAULT 'pending' CHECK (parent_approval_status IN ('pending', 'approved', 'rejected')),
  initiator_parent_approved BOOLEAN DEFAULT false,
  responder_parent_approved BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_moderated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- e.g., 'new_match', 'trade_request', 'approval_needed'
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID, -- could be listing_id, trade_id, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rewards table
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT, -- e.g., 'first_listing', 'completed_trade'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reward_redemptions table
CREATE TABLE public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points_used INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- e.g., 'ad_discount', 'free_listing'
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memberships table for plans
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID REFERENCES public.kids(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type membership_type NOT NULL DEFAULT 'free',
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_id TEXT, -- for payment integration
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Policies for categories (read-only for all)
CREATE POLICY "Everyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- Policies for listings
CREATE POLICY "Kids can manage their listings"
  ON public.listings FOR ALL
  USING (
    kid_id IN (
      SELECT k.id FROM public.kids k
      WHERE k.profile_id = public.get_current_profile_id()
    )
  );

CREATE POLICY "Parents can view listings of their kids"
  ON public.listings FOR SELECT
  USING (
    kid_id IN (
      SELECT pcl.kid_id FROM public.parent_child_links pcl
      JOIN public.parents p ON pcl.parent_id = p.id
      WHERE p.profile_id = public.get_current_profile_id()
    )
  );

CREATE POLICY "Everyone can view active listings"
  ON public.listings FOR SELECT
  USING (is_active = true AND is_moderated = true);

CREATE POLICY "Admins can manage all listings"
  ON public.listings FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Policies for trades
CREATE POLICY "Users can view trades involving their listings"
  ON public.trades FOR SELECT
  USING (
    initiator_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
    OR responder_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
  );

CREATE POLICY "Users can create trades for their listings"
  ON public.trades FOR INSERT
  WITH CHECK (
    initiator_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
  );

CREATE POLICY "Users can update trades involving their listings"
  ON public.trades FOR UPDATE
  USING (
    initiator_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
    OR responder_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
  );

-- Policies for chat_messages
CREATE POLICY "Users can view chat messages for their trades"
  ON public.chat_messages FOR SELECT
  USING (
    trade_id IN (
      SELECT t.id FROM public.trades t
      WHERE t.initiator_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
      OR t.responder_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
    )
  );

CREATE POLICY "Users can send messages for their trades"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    sender_id = public.get_current_profile_id()
    AND trade_id IN (
      SELECT t.id FROM public.trades t
      WHERE t.initiator_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
      OR t.responder_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
    )
  );

-- Policies for notifications
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (user_id = public.get_current_profile_id());

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = public.get_current_profile_id());

-- Policies for feedback
CREATE POLICY "Users can view feedback on their trades"
  ON public.feedback FOR SELECT
  USING (
    trade_id IN (
      SELECT t.id FROM public.trades t
      WHERE t.initiator_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
      OR t.responder_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
    )
  );

CREATE POLICY "Users can create feedback for their completed trades"
  ON public.feedback FOR INSERT
  WITH CHECK (
    reviewer_id = public.get_current_profile_id()
    AND trade_id IN (
      SELECT t.id FROM public.trades t
      WHERE t.status = 'completed'
      AND (t.initiator_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()))
      OR t.responder_listing_id IN (SELECT id FROM public.listings WHERE kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id())))
    )
  );

-- Policies for rewards
CREATE POLICY "Users can view their rewards"
  ON public.rewards FOR SELECT
  USING (user_id = public.get_current_profile_id());

-- Policies for reward_redemptions
CREATE POLICY "Users can view their redemptions"
  ON public.reward_redemptions FOR SELECT
  USING (user_id = public.get_current_profile_id());

CREATE POLICY "Users can create redemptions"
  ON public.reward_redemptions FOR INSERT
  WITH CHECK (user_id = public.get_current_profile_id());

-- Policies for memberships
CREATE POLICY "Users can view their memberships"
  ON public.memberships FOR SELECT
  USING (kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()));

CREATE POLICY "Users can update their memberships"
  ON public.memberships FOR UPDATE
  USING (kid_id IN (SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()));

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage Buckets for Kids Trading App

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 5MB limit
  ('school-ids', 'school-ids', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']), -- 10MB limit, private
  ('listing-photos', 'listing-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 5MB limit
  ('chat-attachments', 'chat-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']); -- 10MB limit, private

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies for avatars bucket (public read, authenticated users can upload their own)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for school-ids bucket (private, only parents and admins can access)
CREATE POLICY "Parents can view school IDs of their kids"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'school-ids'
    AND (
      -- Parents can view school IDs of their linked kids
      EXISTS (
        SELECT 1 FROM public.parent_child_links pcl
        JOIN public.parents p ON pcl.parent_id = p.id
        WHERE p.profile_id = public.get_current_profile_id()
        AND pcl.kid_id::text = (storage.foldername(name))[1]
      )
      -- Admins can view all school IDs
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

CREATE POLICY "Parents can upload school IDs for their kids"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'school-ids'
    AND (
      -- Parents can upload for their linked kids
      EXISTS (
        SELECT 1 FROM public.parent_child_links pcl
        JOIN public.parents p ON pcl.parent_id = p.id
        WHERE p.profile_id = public.get_current_profile_id()
        AND pcl.kid_id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Parents can update school IDs for their kids"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'school-ids'
    AND (
      EXISTS (
        SELECT 1 FROM public.parent_child_links pcl
        JOIN public.parents p ON pcl.parent_id = p.id
        WHERE p.profile_id = public.get_current_profile_id()
        AND pcl.kid_id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Parents can delete school IDs for their kids"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'school-ids'
    AND (
      EXISTS (
        SELECT 1 FROM public.parent_child_links pcl
        JOIN public.parents p ON pcl.parent_id = p.id
        WHERE p.profile_id = public.get_current_profile_id()
        AND pcl.kid_id::text = (storage.foldername(name))[1]
      )
    )
  );

-- Policies for listing-photos bucket (public read, kids can upload their own listings)
CREATE POLICY "Listing photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

CREATE POLICY "Kids can upload photos for their listings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND (
      -- Kids can upload to their own listing folders
      EXISTS (
        SELECT 1 FROM public.listings l
        JOIN public.kids k ON l.kid_id = k.id
        WHERE k.profile_id = public.get_current_profile_id()
        AND l.id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Kids can update photos for their listings"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-photos'
    AND (
      EXISTS (
        SELECT 1 FROM public.listings l
        JOIN public.kids k ON l.kid_id = k.id
        WHERE k.profile_id = public.get_current_profile_id()
        AND l.id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Kids can delete photos for their listings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-photos'
    AND (
      EXISTS (
        SELECT 1 FROM public.listings l
        JOIN public.kids k ON l.kid_id = k.id
        WHERE k.profile_id = public.get_current_profile_id()
        AND l.id::text = (storage.foldername(name))[1]
      )
    )
  );

-- Policies for chat-attachments bucket (private, only trade participants can access)
CREATE POLICY "Trade participants can view chat attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments'
    AND (
      -- Users can view attachments for trades they're involved in
      EXISTS (
        SELECT 1 FROM public.chat_messages cm
        JOIN public.trades t ON cm.trade_id = t.id
        WHERE cm.id::text = (storage.foldername(name))[1]
        AND (
          t.initiator_listing_id IN (
            SELECT id FROM public.listings
            WHERE kid_id IN (
              SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()
            )
          )
          OR t.responder_listing_id IN (
            SELECT id FROM public.listings
            WHERE kid_id IN (
              SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()
            )
          )
        )
      )
    )
  );

CREATE POLICY "Trade participants can upload chat attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND (
      -- Users can upload attachments for trades they're involved in
      EXISTS (
        SELECT 1 FROM public.chat_messages cm
        JOIN public.trades t ON cm.trade_id = t.id
        WHERE cm.id::text = (storage.foldername(name))[1]
        AND (
          t.initiator_listing_id IN (
            SELECT id FROM public.listings
            WHERE kid_id IN (
              SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()
            )
          )
          OR t.responder_listing_id IN (
            SELECT id FROM public.listings
            WHERE kid_id IN (
              SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()
            )
          )
        )
      )
    )
  );

CREATE POLICY "Trade participants can delete chat attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-attachments'
    AND (
      EXISTS (
        SELECT 1 FROM public.chat_messages cm
        JOIN public.trades t ON cm.trade_id = t.id
        WHERE cm.id::text = (storage.foldername(name))[1]
        AND (
          t.initiator_listing_id IN (
            SELECT id FROM public.listings
            WHERE kid_id IN (
              SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()
            )
          )
          OR t.responder_listing_id IN (
            SELECT id FROM public.listings
            WHERE kid_id IN (
              SELECT id FROM public.kids WHERE profile_id = public.get_current_profile_id()
            )
          )
        )
      )
    )
  );