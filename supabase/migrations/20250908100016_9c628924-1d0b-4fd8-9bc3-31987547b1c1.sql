-- Create storage buckets for label uploads and user files
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('label-uploads', 'label-uploads', true),
  ('user-files', 'user-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for label uploads bucket
CREATE POLICY "Users can upload their own label files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'label-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own label files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'label-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own label files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'label-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own label files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'label-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for user-files bucket  
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);