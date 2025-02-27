export const luaScript = `
local asset = ARGV[1]
local needed = tonumber(ARGV[2])
local timeout = tonumber(ARGV[3])
local current_time = redis.call('TIME')[1]
local processing_time = 900

local query_ids = redis.call('ZRANGE', 'query_ids:'..asset, '-inf', current_time - timeout, 'BYSCORE', 'LIMIT', 0, needed)

local updated_pairs = {}
local execution_result = {}

for _, query_id in ipairs(query_ids) do
    table.insert(updated_pairs, current_time + processing_time)
    table.insert(updated_pairs, query_id)
    table.insert(execution_result, query_id)
end

if #query_ids < needed then
    local max_query_id = redis.call('ZCARD', 'query_ids:'..asset)

    for i = 0, needed - #query_ids - 1 do
        table.insert(updated_pairs, current_time + processing_time)
        table.insert(updated_pairs, max_query_id + i)
        table.insert(execution_result, max_query_id + i)
    end
end

redis.call('ZADD', 'query_ids:'..asset, unpack(updated_pairs))
return execution_result
`
