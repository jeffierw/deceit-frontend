import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface AgentListProps {
  agentList: any[];
  onCreateNew: () => void;
  onEdit: (agent: any) => void;
  refreshList: () => Promise<void>;
}

const AgentList = ({
  agentList,
  onCreateNew,
  onEdit,
  refreshList,
}: AgentListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [agentDetails, setAgentDetails] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [startingAgents, setStartingAgents] = useState<{
    [key: string]: boolean;
  }>({});

  const totalPages = Math.ceil(agentList.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = agentList.slice(startIndex, endIndex);

  useEffect(() => {
    setAgentDetails({});
    setIsLoading({});
  }, [agentList]);

  const fetchSingleAgentDetails = async (agent: any) => {
    const objectId = agent.data.objectId;
    if (agentDetails[objectId] || isLoading[objectId]) return;

    setIsLoading((prev) => ({ ...prev, [objectId]: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WALRUS_GET_URL}/${agent.data.content.fields.prompt}`
      );
      const data = await response.json();
      setAgentDetails((prev) => ({
        ...prev,
        [objectId]: data,
      }));
    } catch (error) {
      console.error("Error fetching agent details:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [objectId]: false }));
    }
  };

  useEffect(() => {
    currentData.forEach((agent) => {
      fetchSingleAgentDetails(agent);
    });
  }, [currentData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleStartMatch = async (agentId: string) => {
    setStartingAgents((prev) => ({ ...prev, [agentId]: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AGENT_BASE_API_URL}/game/startMatch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ agentId }),
        }
      );

      const result = await response.json();
      if (result.data.success) {
        toast.success("Match game successfully! Waiting for other players...");
      } else {
        toast.error(result.data.message);
      }
    } catch (error) {
      toast.error("Failed to start match");
    } finally {
      setStartingAgents((prev) => ({ ...prev, [agentId]: false }));
    }
  };

  return (
    <div className="w-full mt-6">
      <div className="flex justify-end items-center mb-4">
        <Button
          onClick={onCreateNew}
          className="bg-[linear-gradient(226deg,#93FE0D_0%,#FFFF00_100%)] rounded-xl"
        >
          Create New Agent
        </Button>
      </div>

      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left">Name</th>
            {/* <th className="px-6 py-3 text-left">ID</th> */}
            <th className="px-6 py-3 text-left">Description</th>
            <th className="px-6 py-3 text-left">Vote</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((agent) => (
            <tr key={agent.data.objectId} className="border-b">
              <td className="px-6 py-4">{agent.data.content.fields.name}</td>
              {/* <td className="px-6 py-4">
                {agent.data.content.fields.id.id.slice(0, 10)}...
              </td> */}
              <td className="px-6 py-4">
                {isLoading[agent.data.objectId] ? (
                  <svg
                    className="animate-spin h-5 w-5 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  agentDetails[agent.data.objectId]?.description || "N/A"
                )}
              </td>
              <td className="px-6 py-4">
                {isLoading[agent.data.objectId] ? (
                  <svg
                    className="animate-spin h-5 w-5 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  agentDetails[agent.data.objectId]?.vote || "N/A"
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => handleStartMatch(agent.data.objectId)}
                    className="bg-[linear-gradient(226deg,#93FE0D_0%,#FFFF00_100%)] hover:scale-105 rounded-xl"
                    disabled={startingAgents[agent.data.objectId]}
                  >
                    {startingAgents[agent.data.objectId] ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : null}
                    Start
                  </Button>
                  <Button
                    onClick={() =>
                      onEdit({
                        ...agent,
                        details: agentDetails[agent.data.objectId],
                      })
                    }
                    className="bg-white border border-[#ccc] hover:scale-105 rounded-xl"
                  >
                    Edit Agent
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
          <div>Total {agentList.length} records</div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-200 hover:bg-gray-300"
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-200 hover:bg-gray-300"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentList;
