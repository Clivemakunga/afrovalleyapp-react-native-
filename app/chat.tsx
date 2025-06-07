// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Image,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   ActivityIndicator
// } from 'react-native';
// import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
// import { supabase } from '@/lib/supabase';

// export default function ChatScreen() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [suggestedUsers, setSuggestedUsers] = useState([]);
//   const [activeChats, setActiveChats] = useState([]);
//   const [activeTab, setActiveTab] = useState('chats');
//   const flatListRef = useRef();

//   // Generate unique keys for items
//   const generateUniqueKey = (prefix = '') => {
//     return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//   };

//   // Get current user, active chats, and suggested users
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const { data: { user }, error: authError } = await supabase.auth.getUser();
//         if (authError) throw authError;
//         setCurrentUser(user);
        
//         if (user) {
//           await fetchActiveChats(user.id);
          
//           const { data: users, error: usersError } = await supabase
//             .from('users')
//             .select('id, name, surname, avatar_url')
//             .neq('id', user.id)
//             .order('created_at', { ascending: false })
//             .limit(5);

//           if (usersError) throw usersError;
//           setSuggestedUsers(users || []);
//         }
//       } catch (error) {
//         console.error('Initialization error:', error);
//       }
//     };
//     fetchData();
//   }, []);

//   // Fetch active chats
//   const fetchActiveChats = async (userId) => {
//     setIsLoading(true);
//     try {
//       const { data, error } = await supabase
//         .rpc('get_user_chats', { user_id: userId });
      
//       if (error) {
//         console.log('Falling back to manual chat query');
//         const { data: manualData, error: manualError } = await supabase
//           .from('messages')
//           .select(`
//             id,
//             content,
//             created_at,
//             sender:sender_id(id, name, surname, avatar_url),
//             receiver:receiver_id(id, name, surname, avatar_url)
//           `)
//           .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
//           .order('created_at', { ascending: false });

//         if (manualError) throw manualError;

//         const chatPartners = {};
//         manualData.forEach(message => {
//           const partner = message.sender_id === userId ? message.receiver : message.sender;
//           if (!chatPartners[partner.id]) {
//             chatPartners[partner.id] = {
//               ...partner,
//               last_message: message.content,
//               last_message_at: message.created_at
//             };
//           }
//         });

//         setActiveChats(Object.values(chatPartners));
//       } else {
//         setActiveChats(data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching active chats:', error);
//       setActiveChats([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Search users with debounce
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchQuery.trim()) {
//         handleSearch();
//       } else {
//         setSearchResults([]);
//       }
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   const handleSearch = async () => {
//     if (!searchQuery.trim() || !currentUser) {
//       setSearchResults([]);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const queryParts = searchQuery.trim().split(/\s+/);
//       const firstName = queryParts[0];
//       const lastName = queryParts[1] || '';

//       let query = supabase
//         .from('users')
//         .select('id, name, surname, avatar_url')
//         .neq('id', currentUser.id);

//       if (queryParts.length === 1) {
//         query = query.or(`name.ilike.%${firstName}%,surname.ilike.%${firstName}%`);
//       } else {
//         query = query.or(
//           `and(name.ilike.%${firstName}%,surname.ilike.%${lastName}%),` +
//           `and(name.ilike.%${lastName}%,surname.ilike.%${firstName}%)`
//         );
//       }

//       const { data, error } = await query;
//       if (error) throw error;
//       setSearchResults(data || []);
//     } catch (error) {
//       console.error('Search error:', error);
//       setSearchResults([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Start a new chat
//   const startChat = (user) => {
//     setSelectedUser(user);
//     setSearchQuery('');
//     setSearchResults([]);
//     fetchMessages(user.id);
//   };

//   // Fetch messages for a conversation
//   const fetchMessages = async (userId) => {
//     if (!currentUser) return;
    
//     setIsLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('messages')
//         .select('*')
//         .or(
//           `and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),` +
//           `and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`
//         )
//         .order('created_at', { ascending: true });

//       if (error) throw error;
//       setMessages(data || []);
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Send a new message
//   const sendMessage = async () => {
//     if (!newMessage.trim() || !selectedUser || !currentUser) return;

//     const tempId = generateUniqueKey('msg');
//     const message = {
//       id: tempId,
//       sender_id: currentUser.id,
//       receiver_id: selectedUser.id,
//       content: newMessage,
//       created_at: new Date().toISOString(),
//       is_read: false,
//       is_temp: true
//     };

//     try {
//       setMessages(prev => [...prev, message]);
//       setNewMessage('');
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

//       const { data, error } = await supabase.from('messages').insert([{
//         sender_id: currentUser.id,
//         receiver_id: selectedUser.id,
//         content: newMessage
//       }]).select();
      
//       if (error) throw error;
      
//       if (data && data[0]) {
//         setMessages(prev => prev.map(m => m.id === tempId ? { ...data[0], is_temp: false } : m));
//       }
      
//       fetchActiveChats(currentUser.id);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages(prev => prev.filter(m => m.id !== tempId));
//     }
//   };

//   // Real-time updates
//   useEffect(() => {
//     if (!selectedUser || !currentUser) return;

//     const channel = supabase
//       .channel('messages')
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'messages',
//           filter: `sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id}`
//         },
//         (payload) => {
//           setMessages(prev => [...prev, payload.new]);
//           setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//           fetchActiveChats(currentUser.id);
//         }
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, [selectedUser, currentUser]);

//   // Key extractors
//   const messageKeyExtractor = (item) => {
//     return item.id || generateUniqueKey('message');
//   };

//   const userKeyExtractor = (item) => {
//     return item.id || generateUniqueKey('user');
//   };

//   if (!currentUser) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#6200ee" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         {selectedUser ? (
//           <View style={styles.userHeader}>
//             <TouchableOpacity onPress={() => setSelectedUser(null)}>
//               <Ionicons name="arrow-back" size={24} color="#333" />
//             </TouchableOpacity>
//             <Image
//               source={{ uri: selectedUser.avatar_url || 'https://i.pravatar.cc/150?img=3' }}
//               style={styles.userAvatar}
//             />
//             <Text style={styles.userName}>
//               {`${selectedUser.name} ${selectedUser.surname}`.trim()}
//             </Text>
//           </View>
//         ) : (
//           <View style={styles.searchContainer}>
//             <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search by name..."
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               returnKeyType="search"
//             />
//             {searchQuery ? (
//               <TouchableOpacity onPress={() => setSearchQuery('')}>
//                 <Feather name="x" size={20} color="#999" />
//               </TouchableOpacity>
//             ) : null}
//           </View>
//         )}
//       </View>

//       {/* Search Results */}
//       {!selectedUser && searchQuery && (
//         <FlatList
//           data={searchResults}
//           keyExtractor={userKeyExtractor}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               style={styles.userItem}
//               onPress={() => startChat(item)}
//             >
//               <Image
//                 source={{ uri: item.avatar_url || 'https://i.pravatar.cc/150?img=3' }}
//                 style={styles.searchAvatar}
//               />
//               <View style={styles.userInfo}>
//                 <Text style={styles.userName}>
//                   {`${item.name} ${item.surname}`.trim()}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           )}
//           ListEmptyComponent={
//             isLoading ? (
//               <View style={styles.loadingMore}>
//                 <ActivityIndicator size="small" color="#6200ee" />
//               </View>
//             ) : (
//               <View style={styles.noResults}>
//                 <Text>No users found</Text>
//               </View>
//             )
//           }
//         />
//       )}

//       {/* Tab Navigation */}
//       {!selectedUser && !searchQuery && (
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'chats' && styles.activeTab]}
//             onPress={() => setActiveTab('chats')}
//           >
//             <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>Chats</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'suggested' && styles.activeTab]}
//             onPress={() => setActiveTab('suggested')}
//           >
//             <Text style={[styles.tabText, activeTab === 'suggested' && styles.activeTabText]}>Suggested</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Active Chats Tab */}
//       {!selectedUser && !searchQuery && activeTab === 'chats' && (
//         <View style={styles.listContainer}>
//           <FlatList
//             data={activeChats}
//             keyExtractor={userKeyExtractor}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.userItem}
//                 onPress={() => startChat({
//                   id: item.id,
//                   name: item.name,
//                   surname: item.surname,
//                   avatar_url: item.avatar_url
//                 })}
//               >
//                 <Image
//                   source={{ uri: item.avatar_url || 'https://i.pravatar.cc/150?img=3' }}
//                   style={styles.searchAvatar}
//                 />
//                 <View style={styles.userInfo}>
//                   <Text style={styles.userName}>
//                     {`${item.name} ${item.surname}`.trim()}
//                   </Text>
//                   <Text style={styles.lastMessage} numberOfLines={1}>
//                     {item.last_message}
//                   </Text>
//                 </View>
//                 <Text style={styles.messageTime}>
//                   {new Date(item.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </Text>
//               </TouchableOpacity>
//             )}
//             ListEmptyComponent={
//               isLoading ? (
//                 <View style={styles.loadingMore}>
//                   <ActivityIndicator size="small" color="#6200ee" />
//                 </View>
//               ) : (
//                 <View style={styles.noResults}>
//                   <Text>No active chats</Text>
//                 </View>
//               )
//             }
//           />
//         </View>
//       )}

//       {/* Suggested Users Tab */}
//       {!selectedUser && !searchQuery && activeTab === 'suggested' && (
//         <View style={styles.listContainer}>
//           <FlatList
//             data={suggestedUsers}
//             keyExtractor={userKeyExtractor}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.userItem}
//                 onPress={() => startChat(item)}
//               >
//                 <Image
//                   source={{ uri: item.avatar_url || 'https://i.pravatar.cc/150?img=3' }}
//                   style={styles.searchAvatar}
//                 />
//                 <View style={styles.userInfo}>
//                   <Text style={styles.userName}>
//                     {`${item.name} ${item.surname}`.trim()}
//                   </Text>
//                   <Text style={styles.userStatus}>Tap to start chatting</Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//             ListEmptyComponent={
//               isLoading ? (
//                 <View style={styles.loadingMore}>
//                   <ActivityIndicator size="small" color="#6200ee" />
//                 </View>
//               ) : (
//                 <View style={styles.noResults}>
//                   <Text>No suggested users</Text>
//                 </View>
//               )
//             }
//           />
//         </View>
//       )}

//       {/* Chat Area */}
//       {selectedUser && (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.chatContainer}
//           keyboardVerticalOffset={90}
//         >
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={messageKeyExtractor}
//             renderItem={({ item }) => (
//               <View
//                 style={[
//                   styles.messageBubble,
//                   item.sender_id === currentUser.id ? styles.sentMessage : styles.receivedMessage
//                 ]}
//               >
//                 <Text style={[
//                   styles.messageText,
//                   item.sender_id === currentUser.id ? styles.sentMessageText : styles.receivedMessageText
//                 ]}>
//                   {item.content}
//                 </Text>
//                 <Text style={[
//                   styles.messageTime,
//                   item.sender_id === currentUser.id ? styles.sentMessageTime : styles.receivedMessageTime
//                 ]}>
//                   {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </Text>
//               </View>
//             )}
//             contentContainerStyle={styles.messagesList}
//             onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//             onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
//           />

//           {/* Message Input */}
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.messageInput}
//               placeholder="Type a message..."
//               value={newMessage}
//               onChangeText={setNewMessage}
//               multiline
//             />
//             <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//               <MaterialIcons
//                 name={newMessage.trim() ? 'send' : 'mic'}
//                 size={24}
//                 color="#fff"
//               />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//   },
//   userHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   userAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginLeft: 15,
//     marginRight: 10,
//   },
//   userName: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   userItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   searchAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 15,
//   },
//   userInfo: {
//     flex: 1,
//     marginRight: 10,
//   },
//   lastMessage: {
//     color: '#666',
//     fontSize: 14,
//     marginTop: 4,
//   },
//   userStatus: {
//     color: '#999',
//     fontSize: 14,
//     marginTop: 4,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   tabButton: {
//     flex: 1,
//     padding: 15,
//     alignItems: 'center',
//     borderBottomWidth: 2,
//     borderBottomColor: 'transparent',
//   },
//   activeTab: {
//     borderBottomColor: '#6200ee',
//   },
//   tabText: {
//     fontSize: 16,
//     color: '#666',
//   },
//   activeTabText: {
//     color: '#6200ee',
//     fontWeight: '600',
//   },
//   listContainer: {
//     flex: 1,
//   },
//   loadingMore: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   noResults: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   chatContainer: {
//     flex: 1,
//   },
//   messagesList: {
//     padding: 15,
//   },
//   messageBubble: {
//     maxWidth: '80%',
//     padding: 12,
//     borderRadius: 15,
//     marginBottom: 10,
//   },
//   sentMessage: {
//     alignSelf: 'flex-end',
//     backgroundColor: '#6200ee',
//     borderTopRightRadius: 5,
//   },
//   receivedMessage: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#f1f1f1',
//     borderTopLeftRadius: 5,
//   },
//   messageText: {
//     fontSize: 16,
//   },
//   sentMessageText: {
//     color: '#fff',
//   },
//   receivedMessageText: {
//     color: '#333',
//   },
//   messageTime: {
//     fontSize: 12,
//     marginTop: 4,
//     textAlign: 'right',
//   },
//   sentMessageTime: {
//     color: 'rgba(255,255,255,0.7)',
//   },
//   receivedMessageTime: {
//     color: '#666',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     backgroundColor: '#fff',
//   },
//   messageInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     maxHeight: 100,
//     marginRight: 10,
//   },
//   sendButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#6200ee',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });