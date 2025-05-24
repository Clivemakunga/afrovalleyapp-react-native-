import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Feather, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
  reactions: any[];
  replies: any[];
  user_has_reacted: boolean;
  reaction_count: number;
  reply_count: number;
};

type CommentsModalProps = {
  post: any;
  onClose: () => void;
  setCommunityPosts: React.Dispatch<React.SetStateAction<any[]>>;
};

export default function CommentsModal({ post, onClose, setCommunityPosts }: CommentsModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // Fetch comments when modal opens
  useEffect(() => {
    if (post) {
      fetchComments();
      fetchUserData();
    }
  }, [post]);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setUser(profile);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user:users(*),
        reactions:comment_reactions(count),
        replies:post_comments(
          *,
          user:users(*),
          reactions:comment_reactions(count)
        )
      `)
      .eq('post_id', post.id)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (!error) {
      const commentsWithData = data.map(comment => ({
        ...comment,
        user_has_reacted: comment.reactions.some(r => r.user_id === user?.id),
        reaction_count: comment.reactions.length,
        reply_count: comment.replies.length
      }));
      setComments(commentsWithData);
    }
  };

const handleAddComment = async () => {
  if (!newComment.trim()) return;

  try {
    // Insert the comment
    const { error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: post.id,
        content: newComment,
        user_id: user?.id,
        parent_comment_id: replyingTo
      }]);

    if (error) throw error;

    // Get updated comment count
    const { count } = await supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);

    // Update the parent component's state
    setCommunityPosts(prevPosts => 
      prevPosts.map(p => 
        p.id === post.id ? { ...p, comments_count: count } : p
      )
    );

    // Reset all comment-related states
    setNewComment('');
    setReplyingTo(null);
    fetchComments(); // Refresh the comments list
    
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

  const handleReaction = async (commentId: string) => {
    if (!user) return;

    const { data: existingReaction, error: reactionError } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single();

    if (existingReaction) {
      await supabase
        .from('comment_reactions')
        .delete()
        .eq('id', existingReaction.id);
    } else {
      await supabase
        .from('comment_reactions')
        .insert([{
          comment_id: commentId,
          user_id: user.id,
          reaction_type: 'like'
        }]);
    }

    fetchComments();
  };

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Image 
        source={{ uri: item.user?.avatar_url || 'https://i.pravatar.cc/40' }} 
        style={styles.commentAvatar} 
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{item.user?.username}</Text>
          <Text style={styles.commentTime}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => handleReaction(item.id)}
          >
            <AntDesign 
              name="like1" 
              size={16} 
              color={item.user_has_reacted ? '#1877f2' : '#65676b'} 
            />
            <Text style={[
              styles.commentActionText,
              item.user_has_reacted && styles.likedActionText
            ]}>
              Like
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => setReplyingTo(item.id)}
          >
            <Feather name="message-square" size={16} color="#65676b" />
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
          
          {item.reaction_count > 0 && (
            <View style={styles.reactionCount}>
              <AntDesign name="like1" size={12} color="#1877f2" />
              <Text style={styles.reactionCountText}>{item.reaction_count}</Text>
            </View>
          )}
        </View>
        
        {item.reply_count > 0 && (
          <TouchableOpacity style={styles.viewReplies}>
            <MaterialIcons name="reply" size={16} color="#65676b" />
            <Text style={styles.viewRepliesText}>
              {item.reply_count} {item.reply_count === 1 ? 'reply' : 'replies'}
            </Text>
          </TouchableOpacity>
        )}
        
        {replyingTo === item.id && (
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Write a reply..."
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={handleAddComment}
              autoFocus
            />
          </View>
        )}
      </View>
    </View>
  );

  if (!post) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onClose={onClose}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Comments</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.commentsList}
        />
        
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyingTo}>
              <Text style={styles.replyingToText}>
                Replying to {comments.find(c => c.id === replyingTo)?.user?.username}
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Feather name="x" size={16} color="#65676b" />
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder={replyingTo ? "Write your reply..." : "Write a comment..."}
            value={newComment}
            onChangeText={setNewComment}
            onSubmitEditing={handleAddComment}
            multiline
          />
          <TouchableOpacity 
            style={styles.postButton}
            onPress={handleAddComment}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsList: {
    padding: 16,
    paddingBottom: 80,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#65676b',
  },
  commentText: {
    fontSize: 14,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    marginLeft: 4,
    color: '#65676b',
    fontSize: 14,
  },
  likedActionText: {
    color: '#1877f2',
  },
  reactionCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reactionCountText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#65676b',
  },
  viewReplies: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  viewRepliesText: {
    marginLeft: 4,
    color: '#65676b',
    fontSize: 14,
  },
  replyInputContainer: {
    marginTop: 8,
  },
  replyInput: {
    backgroundColor: '#f0f2f5',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 12,
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: '#65676b',
  },
  input: {
    backgroundColor: '#f0f2f5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  postButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  postButtonText: {
    color: '#1877f2',
    fontWeight: 'bold',
  },
});