import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { LikedSong, Song } from '@/types';
import { toast } from 'sonner';

export function useLikedSongs() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: likedSongs = [], isLoading } = useQuery<LikedSong[]>({
    queryKey: ['liked-songs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liked_songs')
        .select('*')
        .eq('user_id', user!.id)
        .order('liked_at', { ascending: false });
      if (error) throw error;
      return data as LikedSong[];
    },
  });

  const likedSongIds = new Set(likedSongs.map((ls) => ls.song_id));

  const likeMutation = useMutation({
    mutationFn: async (song: Song) => {
      const { error } = await supabase.from('liked_songs').insert({
        user_id: user!.id,
        song_id: song.id,
        song_title: song.title,
        song_artist: song.artist,
        song_thumbnail: song.thumbnail,
        song_url: song.url,
        song_duration: song.duration,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['liked-songs'] });
      toast.success('Added to Liked Songs ❤️');
    },
    onError: () => toast.error('Failed to like song'),
  });

  const unlikeMutation = useMutation({
    mutationFn: async (songId: string) => {
      const { error } = await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', user!.id)
        .eq('song_id', songId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['liked-songs'] });
      toast.success('Removed from Liked Songs');
    },
    onError: () => toast.error('Failed to unlike song'),
  });

  const toggleLike = (song: Song) => {
    if (likedSongIds.has(song.id)) {
      unlikeMutation.mutate(song.id);
    } else {
      likeMutation.mutate(song);
    }
  };

  const isLiked = (songId: string) => likedSongIds.has(songId);

  return { likedSongs, isLoading, toggleLike, isLiked };
}
