import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider";
import { UserListItem, UserBadgeItem } from "../UserAvatar/index";
import axios from "axios";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState();
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState();

  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery) {
      return;
    }
    setSearch(searchQuery);
  };

  useEffect(() => {
    try {
      setLoading(true);

      const fetchUsers = async () => {
        const { data } = await axios.get(
          `https://chatter-platform.onrender.com/api/user?search=${search}`,
          config
        );
        setSearchResult(data);
        setLoading(false);
      };

      fetchUsers().catch((err) => console.log(err));
    } catch (err) {
      toast({
        title: "Error Occurred",
        description: "Failed to load the search results",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }, [search]);

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedUsers([userToAdd, ...selectedUsers]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(
      selectedUsers.filter((selUser) => selUser._id !== delUser._id)
    );
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchResult([]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill out all of the fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const { data } = await axios.post(
        "https://chatter-platform.onrender.com/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((user) => user._id)),
        },
        config
      );

      setChats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create Group Chat",
        description: error.response.data,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap">
              {selectedUsers.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))}
            </Box>
            {loading ? (
              <div>Loading</div>
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleGroup(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
