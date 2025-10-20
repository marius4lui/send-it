import { useState } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { COLLECTION_COLORS, COLLECTION_ICONS } from '@/constants/colors';
import { storageService } from '@/services/storage';
import * as Haptics from 'expo-haptics';

interface AddCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editCollection?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

export function AddCollectionModal({
  visible,
  onClose,
  onSuccess,
  editCollection,
}: AddCollectionModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState(editCollection?.name || '');
  const [selectedColor, setSelectedColor] = useState(editCollection?.color || COLLECTION_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(editCollection?.icon || COLLECTION_ICONS[0]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    try {
      if (editCollection) {
        await storageService.updateCollection(editCollection.id, {
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
      } else {
        await storageService.addCollection({
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setName('');
      setSelectedColor(COLLECTION_COLORS[0]);
      setSelectedIcon(COLLECTION_ICONS[0]);
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save collection');
    }
  };

  const handleCancel = () => {
    setName(editCollection?.name || '');
    setSelectedColor(editCollection?.color || COLLECTION_COLORS[0]);
    setSelectedIcon(editCollection?.icon || COLLECTION_ICONS[0]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <ThemedText type="title">
              {editCollection ? 'Edit Collection' : 'New Collection'}
            </ThemedText>
            <TouchableOpacity onPress={handleCancel}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                  borderColor: colors.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter collection name"
              placeholderTextColor={colors.text + '60'}
              maxLength={30}
            />

            <ThemedText style={styles.label}>Color</ThemedText>
            <View style={styles.colorGrid}>
              {COLLECTION_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedColor(color);
                  }}
                >
                  {selectedColor === color && (
                    <IconSymbol name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.label}>Icon</ThemedText>
            <View style={styles.iconGrid}>
              {COLLECTION_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: selectedIcon === icon ? selectedColor + '30' : 'transparent',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedIcon(icon);
                  }}
                >
                  <IconSymbol
                    name={icon as any}
                    size={28}
                    color={selectedIcon === icon ? selectedColor : colors.text}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={handleSave}
            >
              <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
                {editCollection ? 'Save' : 'Create'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 30,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
