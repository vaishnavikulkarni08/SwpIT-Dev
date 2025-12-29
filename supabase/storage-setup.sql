-- Supabase Storage Buckets Setup for Kids Trading App
-- Run this script to create storage buckets and policies

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 5MB limit, public
  ('school-ids', 'school-ids', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']), -- 10MB limit, private
  ('listing-photos', 'listing-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 5MB limit, public
  ('chat-attachments', 'chat-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']); -- 10MB limit, private

-- Enable RLS on storage objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ========================================
-- AVATARS BUCKET POLICIES (Public bucket)
-- ========================================

-- Public read access to all avatar images
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar (folder structure: user_id/filename)
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ========================================
-- SCHOOL-IDS BUCKET POLICIES (Private bucket)
-- ========================================

-- Parents can view school IDs of their linked kids, admins can view all
CREATE POLICY "Parents can view school IDs of their kids"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'school-ids'
    AND (
      EXISTS (
        SELECT 1 FROM public.parent_child_links pcl
        JOIN public.parents p ON pcl.parent_id = p.id
        WHERE p.profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        AND pcl.kid_id::text = (storage.foldername(name))[1]
      )
      OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    )
  );

-- Parents can upload school IDs for their kids
CREATE POLICY "Parents can upload school IDs for their kids"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'school-ids'
    AND EXISTS (
      SELECT 1 FROM public.parent_child_links pcl
      JOIN public.parents p ON pcl.parent_id = p.id
      WHERE p.profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND pcl.kid_id::text = (storage.foldername(name))[1]
    )
  );

-- Parents can update school IDs for their kids
CREATE POLICY "Parents can update school IDs for their kids"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'school-ids'
    AND EXISTS (
      SELECT 1 FROM public.parent_child_links pcl
      JOIN public.parents p ON pcl.parent_id = p.id
      WHERE p.profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND pcl.kid_id::text = (storage.foldername(name))[1]
    )
  );

-- Parents can delete school IDs for their kids
CREATE POLICY "Parents can delete school IDs for their kids"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'school-ids'
    AND EXISTS (
      SELECT 1 FROM public.parent_child_links pcl
      JOIN public.parents p ON pcl.parent_id = p.id
      WHERE p.profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND pcl.kid_id::text = (storage.foldername(name))[1]
    )
  );

-- ========================================
-- LISTING-PHOTOS BUCKET POLICIES (Public bucket)
-- ========================================

-- Public read access to all listing photos
CREATE POLICY "Listing photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

-- Kids can upload photos for their own listings
CREATE POLICY "Kids can upload photos for their listings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.kids k ON l.kid_id = k.id
      WHERE k.profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND l.id::text = (storage.foldername(name))[1]
    )
  );

-- Kids can update photos for their listings
CREATE POLICY "Kids can update photos for their listings"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-photos'
    AND EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.kids k ON l.kid_id = k.id
      WHERE k.profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND l.id::text = (storage.foldername(name))[1]
    )
  );

-- Kids can delete photos for their listings
CREATE POLICY "Kids can delete photos for their listings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-photos'
    AND EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.kids k ON l.kid_id = k.id
      WHERE k.profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND l.id::text = (storage.foldername(name))[1]
    )
  );

-- ========================================
-- CHAT-ATTACHMENTS BUCKET POLICIES (Private bucket)
-- ========================================

-- Trade participants can view chat attachments
CREATE POLICY "Trade participants can view chat attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.trades t ON cm.trade_id = t.id
      WHERE cm.id::text = (storage.foldername(name))[1]
      AND (
        t.initiator_listing_id IN (
          SELECT id FROM public.listings
          WHERE kid_id IN (
            SELECT id FROM public.kids WHERE profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
          )
        )
        OR t.responder_listing_id IN (
          SELECT id FROM public.listings
          WHERE kid_id IN (
            SELECT id FROM public.kids WHERE profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
          )
        )
      )
    )
  );

-- Trade participants can upload chat attachments
CREATE POLICY "Trade participants can upload chat attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.trades t ON cm.trade_id = t.id
      WHERE cm.id::text = (storage.foldername(name))[1]
      AND (
        t.initiator_listing_id IN (
          SELECT id FROM public.listings
          WHERE kid_id IN (
            SELECT id FROM public.kids WHERE profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
          )
        )
        OR t.responder_listing_id IN (
          SELECT id FROM public.listings
          WHERE kid_id IN (
            SELECT id FROM public.kids WHERE profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
          )
        )
      )
    )
  );

-- Trade participants can delete chat attachments
CREATE POLICY "Trade participants can delete chat attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.trades t ON cm.trade_id = t.id
      WHERE cm.id::text = (storage.foldername(name))[1]
      AND (
        t.initiator_listing_id IN (
          SELECT id FROM public.listings
          WHERE kid_id IN (
            SELECT id FROM public.kids WHERE profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
          )
        )
        OR t.responder_listing_id IN (
          SELECT id FROM public.listings
          WHERE kid_id IN (
            SELECT id FROM public.kids WHERE profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
          )
        )
      )
    )
  );

-- ========================================
-- USAGE INSTRUCTIONS
-- ========================================
/*
File Structure Recommendations:
- avatars/{user_id}/{filename}
- school-ids/{kid_id}/{filename}
- listing-photos/{listing_id}/{filename}
- chat-attachments/{chat_message_id}/{filename}

Example Upload Code (JavaScript/TypeScript):
```javascript
const uploadToBucket = async (bucketName, file, path) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file);

  if (error) throw error;
  return data;
};

// Upload avatar
await uploadToBucket('avatars', file, `${userId}/avatar.jpg`);

// Upload school ID
await uploadToBucket('school-ids', file, `${kidId}/school-id.pdf`);

// Upload listing photo
await uploadToBucket('listing-photos', file, `${listingId}/photo1.jpg`);
```
*/