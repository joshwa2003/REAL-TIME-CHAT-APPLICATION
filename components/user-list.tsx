import { Users, Clock } from "lucide-react"
import { User } from "@/hooks/useSocket"

interface UserListProps {
  users: User[]
  currentUser: string
}

export function UserList({ users, currentUser }: UserListProps) {
  const namedUsers = users.filter(u => !u.isAnonymous)
  const anonymousCount = users.filter(u => u.isAnonymous).length
  const totalUsers = users.length

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">
          Online Users ({totalUsers})
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Named Users Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Active Users ({namedUsers.length})
          </h4>
          <div className="space-y-2">
            {namedUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No active users yet</p>
            ) : (
              namedUsers.map((user, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    user.username === currentUser
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-sm">
                      {user.username}
                      {user.username === currentUser && (
                        <span className="text-blue-600 ml-1">(You)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(user.joinTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Anonymous Users Section */}
        {anonymousCount > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Connecting Users ({anonymousCount})
            </h4>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-gray-500 text-sm">
                {anonymousCount} {anonymousCount === 1 ? 'user is' : 'users are'} connecting...
              </p>
            </div>
          </div>
        )}

        {totalUsers === 0 && (
          <div className="text-center py-4">
            <Users className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No users online yet</p>
            <p className="text-gray-400 text-xs mt-1">Users will appear here when they join</p>
          </div>
        )}
      </div>
    </div>
  )
}
