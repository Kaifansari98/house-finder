import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenNavbar from "@/components/ScreenNavbar";
import { Trash2, Plus } from "lucide-react-native";
import z from "zod";
import { useSaveTasks } from "@/hooks/task/useTask";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import Toast from "@/components/Toast";
import { useQueryClient } from "@tanstack/react-query";

type TaskError = {
  description?: string;
  time?: string;
};

type Task = {
  description: string;
  time: string;
};
const taskSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Task description is required")
    .min(5, "Minimum 5 characters required"),

  time: z
    .string()
    .trim()
    .min(1, "Time is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Time must be a number",
    })
    .refine((val) => Number(val) > 0, {
      message: "Time must be greater than 0",
    }),
});

const tasksSchema = z.array(taskSchema);

const AddTodayTask = () => {
  const authData = useAuthStore(selectAuthData);
  const userId = authData?.encrypted_user_id;
  const [tasks, setTask] = useState<Task[]>([{ description: "", time: "" }]);
  const [errors, setErrors] = useState<TaskError[]>([]);
  const queryClient = useQueryClient();

  const [toast, setToast] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "info",
    text: "",
  });

  const { mutate, isPending } = useSaveTasks();

  const showToast = (
    type: "success" | "error" | "warning" | "info",
    text: string
  ) => {
    setToast({ visible: true, type, text });

    setTimeout(() => {
      setToast((p) => ({ ...p, visible: false }));
    }, 2200);
  };

  const handleNewTask = () => {
    const newTask = [...tasks, { description: "", time: "" }];
    setTask(newTask);
  };

  const handleRemoveTask = (index: number) => {
    const updateTask = tasks.filter((_, i) => i !== index);
    setTask(updateTask);
  };

  const updateTaskField = (
    index: number,
    field: "description" | "time",
    value: string
  ) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTask(newTasks);
  };

  console.log("userId: ", userId);
  const handleSave = () => {
    const result = tasksSchema.safeParse(tasks);

    if (!result.success) {
      const newErrors: TaskError[] = tasks.map(() => ({}));

      result.error.issues.forEach((issue) => {
        const index = issue.path[0] as number;
        const field = issue.path[1] as keyof TaskError;

        if (newErrors[index]) {
          newErrors[index][field] = issue.message;
        }
      });

      setErrors(newErrors);
      return;
    }

    // ✅ STEP 1: clear errors
    setErrors([]);

    // ✅ STEP 2: TRANSFORM DATA (string → number)
    const formattedTasks = result.data.map((item) => ({
      task: item.description,
      subtask: Number(item.time), // 👈 string → number
    }));

    // ✅ STEP 3: prepare payload
    if (!userId) {
      showToast("error", "User Id Not Found");
      return;
    }

    const payload = {
      user_id: userId,
      tasks: formattedTasks,
    };

    // ✅ STEP 4: API CALL
    mutate(payload, {
      onSuccess: (res) => {
        showToast("success", "Tasks saved successfully");
        // optional: reset form

        queryClient.invalidateQueries({
          queryKey: ["my-tasks"],
        });
        setTask([{ description: "", time: "" }]);
      },
      onError: (err) => {
        showToast("error", "Failed to save tasks");
        console.log("Failed to save task", err);
      },
    });
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={styles.safeArea}
    >
      <Toast visible={toast.visible} type={toast.type} text={toast.text} />
      <ScreenNavbar title="Add Today Task" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {tasks.map((task, index) => (
              <View key={index} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskNumber}>Task {index + 1}</Text>
                  {index !== 0 && (
                    <TouchableOpacity
                      style={styles.removeBtn}
                      activeOpacity={0.7}
                      onPress={() => handleRemoveTask(index)}
                    >
                      <Trash2 size={18} color="#ef4444" strokeWidth={2.2} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Task Description</Text>
                  <TextInput
                    placeholder="Enter task description"
                    placeholderTextColor="#9ca3af"
                    style={[
                      styles.input,
                      task.description && styles.inputFocused,
                      errors[index]?.description && styles.inputError,
                    ]}
                    value={task.description}
                    onChangeText={(text) =>
                      updateTaskField(index, "description", text)
                    }
                    multiline
                  />
                  {errors[index]?.description && (
                    <Text style={styles.errorText}>
                      {errors[index].description}
                    </Text>
                  )}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Time (In Minutes)</Text>
                  <TextInput
                    placeholder="Enter time in minutes"
                    placeholderTextColor="#9ca3af"
                    style={[
                      styles.input,
                      task.time && styles.inputFocused,

                      errors[index]?.time && styles.inputError,
                    ]}
                    keyboardType="numeric"
                    value={task.time}
                    onChangeText={(text) =>
                      updateTaskField(index, "time", text)
                    }
                  />

                  {errors[index]?.time && (
                    <Text style={styles.errorText}>{errors[index].time}</Text>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addTaskBtn}
              onPress={handleNewTask}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#0f172a" strokeWidth={2.5} />
              <Text style={styles.addTaskText}>Add Another Task</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Save Button - Inside KeyboardAvoidingView */}
      <View style={[styles.saveBtnContainer]}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Save Tasks</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddTodayTask;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  container: {
    padding: 10,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  taskNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fee2e2",
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    gap: 0,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 5,
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  inputFocused: {
    borderColor: "#EFBF04",
    borderWidth: 1.5,
  },
  addTaskBtn: {
    flexDirection: "row",
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#EFBF04",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderStyle: "dashed",
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  saveBtnContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  saveBtn: {
    backgroundColor: "#EFBF04",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  //   Error style
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 1,
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
});
