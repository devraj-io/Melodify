-- Melodify Supabase Schema

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create liked_songs table
CREATE TABLE IF NOT EXISTS public.liked_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  song_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_thumbnail TEXT,
  song_url TEXT NOT NULL,
  song_duration INTEGER,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(user_id, song_id)
);

-- Create playlist_songs table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_thumbnail TEXT,
  song_url TEXT NOT NULL,
  song_duration INTEGER,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(playlist_id, song_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Playlists Policies
DROP POLICY IF EXISTS "Users can view their own playlists." ON public.playlists;
CREATE POLICY "Users can view their own playlists." ON public.playlists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own playlists." ON public.playlists;
CREATE POLICY "Users can insert their own playlists." ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own playlists." ON public.playlists;
CREATE POLICY "Users can update their own playlists." ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own playlists." ON public.playlists;
CREATE POLICY "Users can delete their own playlists." ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Liked Songs Policies
DROP POLICY IF EXISTS "Users can view their own liked songs." ON public.liked_songs;
CREATE POLICY "Users can view their own liked songs." ON public.liked_songs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own liked songs." ON public.liked_songs;
CREATE POLICY "Users can insert their own liked songs." ON public.liked_songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own liked songs." ON public.liked_songs;
CREATE POLICY "Users can delete their own liked songs." ON public.liked_songs
  FOR DELETE USING (auth.uid() = user_id);

-- Playlist Songs Policies
DROP POLICY IF EXISTS "Users can view songs in their playlists." ON public.playlist_songs;
CREATE POLICY "Users can view songs in their playlists." ON public.playlist_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_songs.playlist_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can add songs to their playlists." ON public.playlist_songs;
CREATE POLICY "Users can add songs to their playlists." ON public.playlist_songs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can remove songs from their playlists." ON public.playlist_songs;
CREATE POLICY "Users can remove songs from their playlists." ON public.playlist_songs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_id
      AND user_id = auth.uid()
    )
  );

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || SUBSTRING(NEW.id::TEXT, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
