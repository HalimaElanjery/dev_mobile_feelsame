import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { addComment, Comment, getComments } from '../services/commentService';

interface CommentsModalProps {
    visible: boolean;
    onClose: () => void;
    noteId: string;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ visible, onClose, noteId }) => {
    const { colors } = useTheme();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (visible && noteId) {
            loadComments();
        } else {
            setComments([]);
            setLoading(true);
        }
    }, [visible, noteId]);

    const loadComments = async () => {
        setLoading(true);
        const data = await getComments(noteId);
        setComments(data);
        setLoading(false);
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;

        setSending(true);
        try {
            const added = await addComment(noteId, newComment);
            if (added) {
                setComments([...comments, added]);
                setNewComment('');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.title, { color: colors.text }]}>Commentaires</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* List */}
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                ) : (
                    <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                        {comments.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 30, color: colors.textSecondary }}>Soyez le premier à commenter !</Text>
                        ) : (
                            comments.map((c) => (
                                <View key={c.id} style={[
                                    styles.commentRow,
                                    c.isOwn ? { alignSelf: 'flex-end', backgroundColor: colors.primaryLight } : { alignSelf: 'flex-start', backgroundColor: colors.surface },
                                    c.isAuthor && !c.isOwn ? { borderColor: '#FFA500', borderWidth: 1 } : {}
                                ]}>
                                    {c.isAuthor && <Text style={{ fontSize: 10, color: '#FFA500', marginBottom: 2 }}>👑 Auteur</Text>}
                                    <Text style={[styles.commentText, { color: colors.text }]}>{c.content}</Text>
                                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatDate(c.createdAt)}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}

                {/* Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                >
                    <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                            placeholder="Écrire un commentaire..."
                            placeholderTextColor={colors.textSecondary}
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, { opacity: !newComment.trim() || sending ? 0.5 : 1 }]}
                            disabled={!newComment.trim() || sending}
                            onPress={handleSend}
                        >
                            {sending ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="send" size={24} color={colors.primary} />}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    title: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    list: { flex: 1 },
    listContent: { padding: 16 },
    commentRow: {
        maxWidth: '80%',
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
    },
    commentText: { fontSize: 15 },
    dateText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
    },
    sendBtn: {
        padding: 8,
    }
});
