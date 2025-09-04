import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

/**
 * Colors and theme tokens for a minimal, light UI.
 */
const COLORS = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  primary: '#1976D2',
  secondary: '#424242',
  accent: '#FF4081',
  textPrimary: '#212121',
  textSecondary: '#616161',
  divider: '#E0E0E0',
  success: '#2E7D32',
  danger: '#D32F2F',
  muted: '#BDBDBD',
  shadow: '#00000022',
};

type Filter = 'all' | 'active' | 'completed';

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt?: number;
};

/**
 * PUBLIC_INTERFACE
 * A minimalistic Todo App main component.
 * Provides:
 * - Create, Edit, Delete
 * - Toggle Complete
 * - Filter by All / Active / Completed
 * - Floating Action Button (FAB) to add todos
 */
export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  // Modal and inputs for Add/Edit
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<TextInput | null>(null);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // PUBLIC_INTERFACE
  function openAddModal() {
    /** Opens the modal for creating a new todo. */
    setEditingId(null);
    setCurrentTitle('');
    setModalVisible(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // PUBLIC_INTERFACE
  function openEditModal(id: string) {
    /** Opens the modal for editing an existing todo. */
    const t = todos.find(x => x.id === id);
    if (!t) return;
    setEditingId(id);
    setCurrentTitle(t.title);
    setModalVisible(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // PUBLIC_INTERFACE
  function saveTodo() {
    /**
     * Saves a new todo or updates an existing one.
     * - Validates non-empty title.
     */
    const title = currentTitle.trim();
    if (!title) {
      Alert.alert('Empty title', 'Please enter a title for your todo.');
      return;
    }

    if (editingId) {
      setTodos(prev =>
        prev.map(t =>
          t.id === editingId ? { ...t, title, updatedAt: Date.now() } : t
        )
      );
    } else {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newTodo: Todo = {
        id,
        title,
        completed: false,
        createdAt: Date.now(),
      };
      setTodos(prev => [newTodo, ...prev]);
    }

    setModalVisible(false);
    setCurrentTitle('');
    setEditingId(null);
    Keyboard.dismiss();
  }

  // PUBLIC_INTERFACE
  function toggleComplete(id: string) {
    /** Marks a todo as completed or active. */
    setTodos(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t
      )
    );
  }

  // PUBLIC_INTERFACE
  function deleteTodo(id: string) {
    /** Deletes a todo with confirmation. */
    const performDelete = () =>
      setTodos(prev => prev.filter(t => t.id !== id));

    if (Platform.OS === 'web') {
      // Basic confirm substitute for web
      const ok = confirm('Delete this todo?');
      if (ok) performDelete();
      return;
    }

    Alert.alert('Delete todo', 'Are you sure you want to delete this todo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: performDelete, style: 'destructive' },
    ]);
  }

  // PUBLIC_INTERFACE
  function clearCompleted() {
    /** Clears all completed todos. */
    const anyCompleted = todos.some(t => t.completed);
    if (!anyCompleted) return;
    if (Platform.OS === 'web') {
      const ok = confirm('Clear all completed todos?');
      if (ok) setTodos(prev => prev.filter(t => !t.completed));
      return;
    }
    Alert.alert('Clear completed', 'Remove all completed todos?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: () => setTodos(prev => prev.filter(t => !t.completed)) },
    ]);
  }

  const renderItem = ({ item }: { item: Todo }) => {
    return (
      <View style={[styles.todoItem, item.completed && styles.todoItemCompleted]}>
        <Pressable
          onPress={() => toggleComplete(item.id)}
          style={[styles.checkbox, item.completed && styles.checkboxChecked]}
          accessibilityRole="button"
          accessibilityLabel={item.completed ? 'Mark as active' : 'Mark as completed'}
        >
          {item.completed ? (
            <Text style={styles.checkboxIcon}>✓</Text>
          ) : (
            <Text style={styles.checkboxIconPlaceholder} />
          )}
        </Pressable>

        <Pressable
          style={styles.todoTitleWrapper}
          onLongPress={() => openEditModal(item.id)}
          onPress={() => openEditModal(item.id)}
          accessibilityRole="button"
          accessibilityLabel="Edit todo"
        >
          <Text
            numberOfLines={2}
            style={[styles.todoTitle, item.completed && styles.todoTitleCompleted]}
          >
            {item.title}
          </Text>
          <Text style={styles.todoMeta}>
            {item.completed ? 'Completed' : 'Active'}
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => openEditModal(item.id)}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Edit"
          >
            <Text style={[styles.iconText, { color: COLORS.primary }]}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteTodo(item.id)}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Delete"
          >
            <Text style={[styles.iconText, { color: COLORS.danger }]}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const emptyComp = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No todos yet</Text>
      <Text style={styles.emptySubtitle}>Tap the + button to add your first todo</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {Platform.OS !== 'ios' && <View style={styles.topSpacer} />}

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Todos</Text>
          <Text style={styles.headerSubtitle}>Stay on top of your tasks</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <FilterChip
            label="All"
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label="Active"
            selected={filter === 'active'}
            onPress={() => setFilter('active')}
          />
          <FilterChip
            label="Completed"
            selected={filter === 'completed'}
            onPress={() => setFilter('completed')}
          />

          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={clearCompleted} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear Completed</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <View style={styles.listCard}>
          <FlatList
            data={filteredTodos}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListEmptyComponent={emptyComp}
            contentContainerStyle={
              filteredTodos.length === 0 ? styles.emptyContainer : undefined
            }
          />
        </View>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={openAddModal}
          accessibilityRole="button"
          accessibilityLabel="Add todo"
        >
          <Text style={styles.fabIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Modal */}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Todo' : 'New Todo'}</Text>
            <TextInput
              ref={inputRef}
              value={currentTitle}
              onChangeText={setCurrentTitle}
              placeholder="What do you need to do?"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={saveTodo}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => {
                  setModalVisible(false);
                  setCurrentTitle('');
                  setEditingId(null);
                }}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.secondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSave]}
                onPress={saveTodo}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>
                  {editingId ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Filter ${label}`}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? '#fff' : COLORS.secondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSpacer: {
    height: RNStatusBar.currentHeight ?? 0,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipUnselected: {
    backgroundColor: '#fff',
    borderColor: COLORS.divider,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: '#fff',
  },
  clearBtnText: {
    color: COLORS.danger,
    fontWeight: '600',
    fontSize: 12,
  },
  listCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
    gap: 10,
  },
  todoItemCompleted: {
    backgroundColor: '#F7FBFF',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxIcon: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 16,
  },
  checkboxIconPlaceholder: {
    color: 'transparent',
  },
  todoTitleWrapper: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  todoTitleCompleted: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  todoMeta: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 28,
    marginTop: -2,
    fontWeight: '800',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 8, default: 10 }),
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCancel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  modalSave: {
    backgroundColor: COLORS.primary,
  },
  modalBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
