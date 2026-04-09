import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Playlist, PlaylistSong, Song } from '@/types';
import { toast } from 'sonner';

export function usePlaylists() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: playlists = [], isLoading } = useQuery<Playlist[]>({
    queryKey: ['playlists', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Playlist[];
    },
  });

  const createPlaylist = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('playlists')
        .insert({ name, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist created!');
    },
    onError: () => toast.error('Failed to create playlist'),
  });

  const deletePlaylist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('playlists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist deleted');
    },
  });

  const addSongToPlaylist = useMutation({
    mutationFn: async ({ playlistId, song }: { playlistId: string; song: Song }) => {
      const { error } = await supabase.from('playlist_songs').insert({
        playlist_id: playlistId,
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
      qc.invalidateQueries({ queryKey: ['playlist-songs'] });
      toast.success('Added to playlist!');
    },
    onError: () => toast.error('Failed to add to playlist'),
  });

  const removeSongFromPlaylist = useMutation({
    mutationFn: async (playlistSongId: string) => {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('id', playlistSongId);
      if (error) throw error;
    },
    onSuccess: (_data, playlistSongId, context: any) => {
      qc.invalidateQueries({ queryKey: ['playlist-songs'] });
      toast.success('Removed from playlist');
    },
  });

  return {
    playlists,
    isLoading,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
  };
}

export function usePlaylistSongs(playlistId: string | undefined) {
  return useQuery<PlaylistSong[]>({
    queryKey: ['playlist-songs', playlistId],
    enabled: !!playlistId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlist_songs')
        .select('*')
        .eq('playlist_id', playlistId!)
        .order('added_at', { ascending: true });
      if (error) throw error;
      return data as PlaylistSong[];
    },
  });
}
