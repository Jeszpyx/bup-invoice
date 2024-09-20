import { useState } from "react";
import {
  Textarea,
  NumberInput,
  Button,
  Box,
  Stack,
  Container,
  TextInput,
  Center,
} from "@mantine/core";
import toast from "react-hot-toast";
import { IconAt } from "@tabler/icons-react";

const cardsMinCount = 10;
const cardsMaxCount = 5000;

function App() {
  const [requisites, setRequisites] = useState<string>("");
  const [cardsCount, setCardCount] = useState<number>(cardsMinCount);
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<{
    requisites?: string;
    cardCount?: string;
    email?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = () => {
    const newErrors: {
      requisites?: string;
      cardCount?: string;
      email?: string;
    } = {};

    if (!requisites.trim()) {
      newErrors.requisites = "Реквизиты не могут быть пустыми";
    }

    if (cardsCount < cardsMinCount || cardsCount > cardsMaxCount) {
      newErrors.cardCount = `Количество карт должно быть от ${cardsMinCount} до ${cardsMaxCount}`;
    }

    if (!isValidEmail(email)) {
      newErrors.email = "Введите корректный email адрес";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Начало запроса");
      const response = await fetch("https://threepoplars.ru/bup/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          details: requisites,
          cardsCount,
          email,
        }),
        credentials: "include",
      });
      console.log("Ответ получен:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Ошибка ответа:",
          response.status,
          response.statusText,
          errorText
        );
        toast.error(`Произошла ошибка при загрузке документа: ${errorText}`);
        return;
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "invoice.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      console.log("Имя файла:", filename);

      const blob = await response.blob();
      console.log("Blob получен, размер:", blob.size);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Документ успешно загружен");
    } catch (error) {
      console.error("Ошибка при выполнении запроса:", error);
      toast.error(`Произошла ошибка при загрузке документа: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center h={"100vh"}>
      <Box display="flex">
        <Container
          size="xs"
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Stack gap="md">
            <Textarea
              label="Реквизиты"
              value={requisites}
              onChange={(event) => setRequisites(event.currentTarget.value)}
              autosize
              minRows={4}
              withAsterisk
              error={errors.requisites}
            />
            <NumberInput
              label="Количество карт"
              value={cardsCount}
              onChange={(value) => setCardCount(Number(value))}
              withAsterisk
              min={cardsMinCount}
              max={cardsMaxCount}
              error={errors.cardCount}
            />
            <TextInput
              label="Email"
              leftSection={<IconAt size={16} />}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              withAsterisk
              error={errors.email}
            />
            <Button onClick={handleSubmit} loading={isLoading}>
              Получить документ
            </Button>
          </Stack>
        </Container>
      </Box>
    </Center>
  );
}

export default App;
