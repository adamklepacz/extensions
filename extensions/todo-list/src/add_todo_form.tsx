import { Action, ActionPanel, Form, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { useAtom } from "jotai";
import _ from "lodash";
import { useEffect, useState } from "react";
import { editingAtom, newTodoTextAtom, searchBarTextAtom, searchModeAtom, todoAtom } from "./atoms";
import { compare, insertIntoSection } from "./utils";
import TodoList from "./index";

export default function AddTodoForm(props: { title?: string; listName?: string }) {
  const defaultValues: Form.Values = {
    title: props.title || "",
    deadline: undefined,
  };
  const [values, setValues] = useState<Form.Values>(defaultValues);

  const ERROR_MESSAGE = "Title is required";

  const { push } = useNavigation();

  const setValue = (key: string) => (value: string | string[] | Date) => {
    setValues({ ...values, [key]: value });
  };

  const [todoSections, setTodoSections] = useAtom(todoAtom);

  // TODO: When a todo has deadline we need to enable the due date to be edited as well using the same view
  const [editing, setEditing] = useAtom(editingAtom);

  const addTodo = async () => {
    if (values.title.length === 0) {
      await showToast(Toast.Style.Failure, ERROR_MESSAGE);
      return;
    }
    todoSections.todo = [
      ...insertIntoSection(
        todoSections.todo,
        {
          title: values.title,
          completed: false,
          timeAdded: Date.now(),
          deadline: values.deadline,
        },
        compare
      ),
    ];

    setValues({ ...defaultValues, title: "" });
    setTodoSections(_.cloneDeep(todoSections));
    push(<TodoList />);
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Add New To-Do" onAction={addTodo} icon={Icon.Plus} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        value={values.title}
        onChange={setValue("title")}
        placeholder="Type to create a new todo item on your list..."
      />
      <Form.DatePicker
        id="deadline"
        title="Deadline"
        value={values.deadline}
        onChange={(deadlineDate) => setValue("deadline")(deadlineDate)}
      />
    </Form>
  );
}
