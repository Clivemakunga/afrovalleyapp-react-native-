import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    Image,
    TouchableOpacity,
    FlatList,
    Modal,
    Pressable,
    Alert,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons, FontAwesome, Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { decode } from 'base64-arraybuffer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function CollaborateScreen() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [collaborations, setCollaborations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    //   const [selectedCollaboration, setSelectedCollaboration] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCollaboration, setSelectedCollaboration] = useState({
        id: '',
        title: '',
        description: '',
        media: [],
        files: [],
        skills_needed: [],
        deadline: '',
        is_active: true,
        user_id: '',
        requests: []
    });

    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        files: [],
        media: [],
        skillsNeeded: [],
        deadline: '',
        isActive: true
    });

    const [collaborationRequest, setCollaborationRequest] = useState({
        name: '',
        email: '',
        message: '',
        portfolio: ''
    });

    const [mediaPreview, setMediaPreview] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);

    const handleSelectCollaboration = (item) => {
  if (!item) return;
  
  setSelectedCollaboration({
    id: item.id || '',
    title: item.title || '',
    description: item.description || '',
    media: item.media || [],
    files: item.files || [],
    skills_needed: item.skills_needed || [],
    deadline: item.deadline || '',
    is_active: item.is_active !== false,
    user_id: item.user_id || '',
    requests: item.requests || []
  });
  setShowDetailsModal(true);
};

    useFocusEffect(
        React.useCallback(() => {
            fetchCollaborations();
            fetchUserData();

            return () => {
                // Optional cleanup function
            };
        }, [])
    );

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

const fetchCollaborations = async () => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase
            .from('collaborations')
            .select(`
                *,
                requests:collaboration_requests(count),
                user:users(name, surname, avatar_url)
            `)
            .order('created_at', { ascending: false });

        if (!error) {
            const collaborationsWithCounts = data.map(collab => ({
                ...collab,
                requests_count: collab.requests[0]?.count || 0,
                user: {
                    ...collab.user,
                    // Combine name and surname for display
                    fullName: `${collab.user.name || ''} ${collab.user.surname || ''}`.trim()
                }
            }));
            setCollaborations(collaborationsWithCounts);
        } else {
            console.error('Supabase error:', error);
        }
    } catch (error) {
        console.error('Error fetching collaborations:', error);
    } finally {
        setIsLoading(false);
    }
};

    const handleCloseDetailsModal = () => {
  setSelectedCollaboration({
    id: '',
    title: '',
    description: '',
    media: [],
    files: [],
    skills_needed: [],
    deadline: '',
    is_active: true,
    user_id: '',
    requests: []
  });
  setShowDetailsModal(false);
};



    const pickMedia = async (type) => {
        let result;
        if (type === 'image') {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
        } else if (type === 'video') {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 1,
            });
        }

        if (!result.canceled) {
            const asset = result.assets[0];
            setMediaPreview(prev => [...prev, asset.uri]);
            setNewProject(prev => ({
                ...prev,
                media: [...prev.media, { uri: asset.uri, type }]
            }));
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            });

            if (result.type === 'success') {
                setFilePreviews(prev => [...prev, result.name]);
                setNewProject(prev => ({
                    ...prev,
                    files: [...prev.files, { uri: result.uri, name: result.name, type: result.mimeType }]
                }));
            }
        } catch (error) {
            console.error('Error picking document:', error);
        }
    };

    const uploadFiles = async (files) => {
        const uploadedFiles = [];

        for (const file of files) {
            const fileExt = file.uri.split('.').pop();
            const fileName = `${Date.now()}-${file.name || `file.${fileExt}`}`;
            const filePath = `collaboration-files/${fileName}`;

            try {
                const response = await fetch(file.uri);
                const blob = await response.blob();

                const base64data = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        resolve(reader.result);
                    };
                });

                const base64 = base64data.split(',')[1];
                const arrayBuffer = decode(base64);

                // Upload to the correct bucket
                const { error: uploadError } = await supabase.storage
                    .from('collaboration-media') // Make sure this matches your bucket name
                    .upload(filePath, arrayBuffer, {
                        contentType: file.type || 'application/octet-stream',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('File upload error:', uploadError);
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('collaboration-media')
                    .getPublicUrl(filePath);

                uploadedFiles.push({
                    url: publicUrl,
                    name: file.name,
                    type: file.type
                });
            } catch (error) {
                console.error('Error uploading file:', error);
                throw error;
            }
        }

        return uploadedFiles;
    };

    const handleSubmitProject = async () => {
        try {
            // Validate description length
            const wordCount = newProject.description.trim().split(/\s+/).length;
            if (wordCount < 30 || wordCount > 500) {
                Alert.alert(
                    'Invalid Description',
                    'Description must be between 30 and 500 words',
                    [{ text: 'OK' }]
                );
                return;
            }

            if (!newProject.title || !newProject.description) {
                Alert.alert(
                    'Missing Information',
                    'Please fill in all required fields',
                    [{ text: 'OK' }]
                );
                return;
            }

            setIsSubmitting(true);

            // Upload media files
            let uploadedMedia = [];
            if (newProject.media.length > 0) {
                uploadedMedia = await uploadFiles(newProject.media);
            }

            // Upload documents
            let uploadedFiles = [];
            if (newProject.files.length > 0) {
                uploadedFiles = await uploadFiles(newProject.files);
            }

            // Create collaboration project
            const { data, error } = await supabase
                .from('collaborations')
                .insert([{
                    title: newProject.title,
                    description: newProject.description,
                    media: uploadedMedia,
                    files: uploadedFiles,
                    skills_needed: newProject.skillsNeeded,
                    deadline: newProject.deadline,
                    is_active: true,
                    user_id: user?.id
                }])
                .select();

            if (error) {
                console.error('Project creation error:', error);
                Alert.alert(
                    'Error',
                    `Failed to create project: ${error.message}`,
                    [{ text: 'OK' }]
                );
                return;
            }

            Alert.alert(
                'Success',
                'Your collaboration project has been posted!',
                [{ text: 'OK' }]
            );

            setCollaborations(prev => [data[0], ...prev]);
            setShowAddModal(false);
            resetForm();
            fetchCollaborations();

        } catch (error) {
            console.error('Error in handleSubmitProject:', error);
            Alert.alert(
                'Error',
                'Failed to create project. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitRequest = async () => {
        try {
            if (!collaborationRequest.name || !collaborationRequest.email || !collaborationRequest.message) {
                Alert.alert(
                    'Missing Information',
                    'Please fill in all required fields',
                    [{ text: 'OK' }]
                );
                return;
            }

            setIsSubmitting(true);

            const { data, error } = await supabase
                .from('collaboration_requests')
                .insert([{
                    collaboration_id: selectedCollaboration.id,
                    name: collaborationRequest.name,
                    email: collaborationRequest.email,
                    message: collaborationRequest.message,
                    portfolio: collaborationRequest.portfolio,
                    status: 'pending'
                }])
                .select();

            if (error) {
                console.error('Request submission error:', error);
                Alert.alert(
                    'Error',
                    `Failed to submit request: ${error.message}`,
                    [{ text: 'OK' }]
                );
                return;
            }

            Alert.alert(
                'Success',
                'Your collaboration request has been submitted!',
                [{ text: 'OK', onPress: () => setShowRequestModal(false) }]
            );

            setCollaborationRequest({
                name: '',
                email: '',
                message: '',
                portfolio: ''
            });

            fetchCollaborations();

        } catch (error) {
            console.error('Error in handleSubmitRequest:', error);
            Alert.alert(
                'Error',
                'Failed to submit request. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCollaborationStatus = async (collaborationId, currentStatus) => {
        if (!collaborationId) return;

        try {
            const { error } = await supabase
                .from('collaborations')
                .update({ is_active: !currentStatus })
                .eq('id', collaborationId);

            if (error) throw error;

            fetchCollaborations();
        } catch (error) {
            console.error('Error toggling collaboration status:', error);
            Alert.alert(
                'Error',
                'Failed to update collaboration status',
                [{ text: 'OK' }]
            );
        }
    };

    const resetForm = () => {
        setNewProject({
            title: '',
            description: '',
            files: [],
            media: [],
            skillsNeeded: [],
            deadline: '',
            isActive: true
        });
        setMediaPreview([]);
        setFilePreviews([]);
    };

    const renderCollaborationItem = ({ item }) => (
        <View style={styles.collaborationCard}>
            <View style={styles.collaborationHeader}>
                <Image
                    source={{ uri: item.user?.avatar_url || 'https://i.pravatar.cc/40' }}
                    style={styles.avatar}
                />
                <Text style={styles.collaborationUser}>
                {item.user?.fullName || 'Anonymous'}
            </Text>
                {item.user_id === user?.id && (
                    <TouchableOpacity
                        style={styles.statusButton}
                        onPress={() => toggleCollaborationStatus(item.id, item.is_active)}
                    >
                        <Text style={styles.statusButtonText}>
                            {item.is_active ? 'Close Collaboration' : 'Reopen Collaboration'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.collaborationTitle}>{item.title}</Text>
            <Text style={styles.collaborationDescription} numberOfLines={3}>
                {item.description}
            </Text>

            {item.media && item.media.length > 0 && (
                <ScrollView horizontal style={styles.mediaContainer}>
                    {item.media.map((media, index) => (
                        media.type === 'image' ? (
                            <Image
                                key={index}
                                source={{ uri: media.url }}
                                style={styles.mediaThumbnail}
                            />
                        ) : (
                            <View key={index} style={[styles.mediaThumbnail, styles.videoThumbnail]}>
                                <Feather name="play-circle" size={32} color="#6200ee" />
                            </View>
                        )
                    ))}
                </ScrollView>
            )}

            <View style={styles.collaborationFooter}>
                <Text style={styles.skillsText}>
                    Skills needed: {item.skills_needed?.join(', ') || 'Not specified'}
                </Text>
                {item.deadline && (
                    <Text style={styles.deadlineText}>
                        Deadline: {new Date(item.deadline).toLocaleDateString()}
                    </Text>
                )}
                <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => {
                        setSelectedCollaboration(item);
                        setShowDetailsModal(true);
                    }}
                >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>

                {item.user_id !== user?.id && item.is_active && (
                    <TouchableOpacity
                        style={styles.requestButton}
                        onPress={() => {
                            setSelectedCollaboration(item);
                            setShowRequestModal(true);
                        }}
                    >
                        <Text style={styles.requestButtonText}>Request to Collaborate</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.requestCount}>
                    <Feather name="users" size={16} color="#666" />
                    <Text style={styles.requestCountText}>
                        {item.requests_count || 0} requests
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Collaborate</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
                    >
                        <AntDesign name="plus" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
<FlatList
    data={collaborations}
    renderItem={renderCollaborationItem}
    keyExtractor={item => item.id.toString()}
    contentContainerStyle={styles.listContent}
    refreshing={isLoading}
    onRefresh={fetchCollaborations}
    ListEmptyComponent={
        isLoading ? (
            <ActivityIndicator size="large" color="#6200ee" />
        ) : (
            <View style={styles.emptyState}>
                <Feather name="users" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No collaboration projects yet</Text>
                <Text style={styles.emptyStateSubtext}>Be the first to post a project!</Text>
            </View>
        )
    }
/>

                {/* Add Project Modal */}
                <Modal visible={showAddModal} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.addModalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Collaboration Project</Text>
                                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                    <Feather name="x" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalContent}>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Project Title*"
                                    value={newProject.title}
                                    onChangeText={(text) => setNewProject({ ...newProject, title: text })}
                                />

                                <TextInput
                                    style={[styles.inputField, styles.descriptionInput]}
                                    placeholder="Description (30-500 words)*"
                                    multiline
                                    numberOfLines={6}
                                    value={newProject.description}
                                    onChangeText={(text) => setNewProject({ ...newProject, description: text })}
                                />

                                <Text style={styles.sectionLabel}>Add Media (Images/Videos)</Text>
                                <View style={styles.mediaButtons}>
                                    <TouchableOpacity
                                        style={styles.mediaButton}
                                        onPress={() => pickMedia('image')}
                                    >
                                        <Feather name="image" size={24} color="#6200ee" />
                                        <Text style={styles.mediaButtonText}>Add Image</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.mediaButton}
                                        onPress={() => pickMedia('video')}
                                    >
                                        <Feather name="video" size={24} color="#6200ee" />
                                        <Text style={styles.mediaButtonText}>Add Video</Text>
                                    </TouchableOpacity>
                                </View>

                                {mediaPreview.length > 0 && (
                                    <ScrollView horizontal style={styles.previewContainer}>
                                        {mediaPreview.map((uri, index) => (
                                            <View key={index} style={styles.previewItem}>
                                                <Image source={{ uri }} style={styles.previewImage} />
                                                <TouchableOpacity
                                                    style={styles.removePreviewButton}
                                                    onPress={() => {
                                                        const newMedia = [...mediaPreview];
                                                        newMedia.splice(index, 1);
                                                        setMediaPreview(newMedia);

                                                        const newProjectMedia = [...newProject.media];
                                                        newProjectMedia.splice(index, 1);
                                                        setNewProject({ ...newProject, media: newProjectMedia });
                                                    }}
                                                >
                                                    <Feather name="x" size={16} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}

                                <Text style={styles.sectionLabel}>Add Files (PDFs, Docs)</Text>
                                <TouchableOpacity
                                    style={styles.fileButton}
                                    onPress={pickDocument}
                                >
                                    <Feather name="file" size={24} color="#6200ee" />
                                    <Text style={styles.fileButtonText}>Add Document</Text>
                                </TouchableOpacity>

                                {filePreviews.length > 0 && (
                                    <View style={styles.filePreviews}>
                                        {filePreviews.map((name, index) => (
                                            <View key={index} style={styles.filePreviewItem}>
                                                <Feather name="file" size={20} color="#6200ee" />
                                                <Text style={styles.filePreviewText} numberOfLines={1}>
                                                    {name}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        const newFiles = [...filePreviews];
                                                        newFiles.splice(index, 1);
                                                        setFilePreviews(newFiles);

                                                        const newProjectFiles = [...newProject.files];
                                                        newProjectFiles.splice(index, 1);
                                                        setNewProject({ ...newProject, files: newProjectFiles });
                                                    }}
                                                >
                                                    <Feather name="x" size={16} color="#666" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <Text style={styles.sectionLabel}>Skills Needed (comma separated)</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="e.g., Graphic Design, Photography, Coding"
                                    value={newProject.skillsNeeded.join(', ')}
                                    onChangeText={(text) => setNewProject({
                                        ...newProject,
                                        skillsNeeded: text.split(',').map(skill => skill.trim())
                                    })}
                                />

                                <Text style={styles.sectionLabel}>Deadline (optional)</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="YYYY-MM-DD"
                                    value={newProject.deadline}
                                    onChangeText={(text) => setNewProject({ ...newProject, deadline: text })}
                                />
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Pressable
                                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                                    onPress={handleSubmitProject}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Post Project</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Project Details Modal */}
                {showDetailsModal && selectedCollaboration && (
                    <Modal visible={showDetailsModal} animationType="slide" transparent={true}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.detailsModalContainer}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Project Details</Text>
                                    <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                                        <Feather name="x" size={24} color="#666" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalContent}>
                                    <Text style={styles.detailTitle}>{selectedCollaboration?.title}</Text>
                                    <Text style={styles.detailDescription}>
                                        {selectedCollaboration?.description}
                                    </Text>

                                    {selectedCollaboration?.skills_needed?.length > 0 && (
                                        <>
                                            <Text style={styles.detailSectionTitle}>Skills Needed</Text>
                                            <View style={styles.skillsContainer}>
                                                {selectedCollaboration.skills_needed.map((skill, index) => (
                                                    <View key={index} style={styles.skillTag}>
                                                        <Text style={styles.skillText}>{skill}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </>
                                    )}

                                    {selectedCollaboration?.deadline && (
                                        <>
                                            <Text style={styles.detailSectionTitle}>Deadline</Text>
                                            <Text style={styles.detailText}>
                                                {new Date(selectedCollaboration.deadline).toLocaleDateString()}
                                            </Text>
                                        </>
                                    )}

                                    {selectedCollaboration?.media?.length > 0 && (
                                        <>
                                            <Text style={styles.detailSectionTitle}>Media</Text>
                                            <ScrollView horizontal style={styles.detailMediaContainer}>
                                                {selectedCollaboration.media.map((item, index) => (
                                                    item.type === 'image' ? (
                                                        <Image
                                                            key={index}
                                                            source={{ uri: item.url }}
                                                            style={styles.detailMedia}
                                                        />
                                                    ) : (
                                                        <View key={index} style={[styles.detailMedia, styles.detailVideo]}>
                                                            <Feather name="play-circle" size={48} color="#6200ee" />
                                                        </View>
                                                    )
                                                ))}
                                            </ScrollView>
                                        </>
                                    )}

                                    {selectedCollaboration?.files?.length > 0 && (
                                        <>
                                            <Text style={styles.detailSectionTitle}>Files</Text>
                                            <View style={styles.filesContainer}>
                                                {selectedCollaboration.files.map((file, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={styles.fileItem}
                                                        onPress={() => Linking.openURL(file.url)}
                                                    >
                                                        <Feather name="file" size={20} color="#6200ee" />
                                                        <Text style={styles.fileName} numberOfLines={1}>
                                                            {file.name || 'Document'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </>
                                    )}
                                </ScrollView>

                                {selectedCollaboration?.user_id === user?.id && (
                                    <View style={styles.modalFooter}>
                                        <Pressable
                                            style={[styles.submitButton, styles.toggleButton]}
                                            onPress={() => {
                                                if (selectedCollaboration) {
                                                    toggleCollaborationStatus(
                                                        selectedCollaboration.id,
                                                        selectedCollaboration.is_active
                                                    );
                                                    setShowDetailsModal(false);
                                                }
                                            }}
                                        >
                                            <Text style={styles.submitButtonText}>
                                                {selectedCollaboration?.is_active
                                                    ? 'Close Collaboration'
                                                    : 'Reopen Collaboration'}
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>)}

                {/* Request to Collaborate Modal */}
                <Modal visible={showRequestModal} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.requestModalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Request to Collaborate</Text>
                                <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                                    <Feather name="x" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalContent}>
                                <Text style={styles.requestProjectTitle}>
                                    {selectedCollaboration?.title}
                                </Text>

                                <Text style={styles.sectionLabel}>Your Name*</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Full Name"
                                    value={collaborationRequest.name}
                                    onChangeText={(text) => setCollaborationRequest({ ...collaborationRequest, name: text })}
                                />

                                <Text style={styles.sectionLabel}>Email*</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Email Address"
                                    keyboardType="email-address"
                                    value={collaborationRequest.email}
                                    onChangeText={(text) => setCollaborationRequest({ ...collaborationRequest, email: text })}
                                />

                                <Text style={styles.sectionLabel}>Message*</Text>
                                <TextInput
                                    style={[styles.inputField, styles.descriptionInput]}
                                    placeholder="Why do you want to collaborate on this project?"
                                    multiline
                                    numberOfLines={4}
                                    value={collaborationRequest.message}
                                    onChangeText={(text) => setCollaborationRequest({ ...collaborationRequest, message: text })}
                                />

                                <Text style={styles.sectionLabel}>Portfolio/Website (optional)</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Link to your work"
                                    keyboardType="url"
                                    value={collaborationRequest.portfolio}
                                    onChangeText={(text) => setCollaborationRequest({ ...collaborationRequest, portfolio: text })}
                                />
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Pressable
                                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                                    onPress={handleSubmitRequest}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Submit Request</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        padding: 10,
        backgroundColor: '#6200ee',
        borderRadius: 8,
    },
    listContent: {
        padding: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    collaborationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    collaborationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    collaborationUser: {
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 'auto',
    },
    statusButton: {
        backgroundColor: '#f0e9ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusButtonText: {
        color: '#6200ee',
        fontSize: 12,
        fontWeight: '500',
    },
    collaborationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    collaborationDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    mediaContainer: {
        marginBottom: 12,
    },
    mediaThumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#eee',
    },
    videoThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    collaborationFooter: {
        marginTop: 8,
    },
    skillsText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    deadlineText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    detailsButton: {
        backgroundColor: '#6200ee',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    detailsButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    requestButton: {
        backgroundColor: '#f0e9ff',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    requestButtonText: {
        color: '#6200ee',
        fontWeight: 'bold',
    },
    requestCount: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    requestCountText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    addModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    detailsModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    requestModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 16,
    },
    inputField: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    descriptionInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    mediaButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    mediaButton: {
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        width: '45%',
    },
    mediaButtonText: {
        marginTop: 8,
        color: '#6200ee',
    },
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
    },
    fileButtonText: {
        marginLeft: 8,
        color: '#6200ee',
    },
    previewContainer: {
        marginBottom: 16,
    },
    previewItem: {
        position: 'relative',
        marginRight: 8,
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removePreviewButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filePreviews: {
        marginBottom: 16,
    },
    filePreviewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 8,
    },
    filePreviewText: {
        flex: 1,
        marginLeft: 8,
        marginRight: 8,
        color: '#666',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    submitButton: {
        backgroundColor: '#6200ee',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#9e7aff',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    toggleButton: {
        backgroundColor: '#f0e9ff',
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    detailDescription: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
        lineHeight: 24,
    },
    detailSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    skillTag: {
        backgroundColor: '#f0e9ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    skillText: {
        color: '#6200ee',
        fontSize: 12,
    },
    detailMediaContainer: {
        marginBottom: 16,
    },
    detailMedia: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#eee',
    },
    detailVideo: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    filesContainer: {
        marginBottom: 16,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 8,
    },
    fileName: {
        flex: 1,
        marginLeft: 8,
        color: '#666',
    },
    requestProjectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});